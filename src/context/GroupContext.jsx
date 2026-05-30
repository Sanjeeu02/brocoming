import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  collection, doc, setDoc, getDoc, updateDoc, onSnapshot, 
  query, where, getDocs, addDoc, serverTimestamp, deleteDoc, orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { startTracking, calcDistance, calcETA, detectStatus, isAtDestination } from '../services/locationService';

const GroupContext = createContext(null);

function generateCode(length = 7) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function GroupProvider({ children }) {
  const { user } = useAuth();
  
  const [activeGroup, setActiveGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [destination, setDestination] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [groupLocked, setGroupLocked] = useState(false);
  const [fakeAlert, setFakeAlert] = useState(null);
  
  const locationStopRef = useRef(null);
  const myLastLocationRef = useRef(null);
  const myLastMovedTimeRef = useRef(null);
  
  // Listeners refs to clean up
  const groupListenerRef = useRef(null);
  const membersListenerRef = useRef(null);
  const messagesListenerRef = useRef(null);

  const stopLocationTracking = () => {
    if (locationStopRef.current) {
      locationStopRef.current();
      locationStopRef.current = null;
    }
  };

  // Clear everything when leaving a group
  const clearGroupState = () => {
    setActiveGroup(null);
    setMembers([]);
    setMessages([]);
    setDestination(null);
    setUserRole(null);
    setGroupLocked(false);
    
    if (groupListenerRef.current) groupListenerRef.current();
    if (membersListenerRef.current) membersListenerRef.current();
    if (messagesListenerRef.current) messagesListenerRef.current();
    stopLocationTracking();
  };

  // Set up Firebase real-time listeners for the active group
  useEffect(() => {
    if (!activeGroup || !activeGroup.groupId) return;

    // 1. Group Listener (for destination changes, locks, etc)
    const groupRef = doc(db, 'groups', activeGroup.groupId);
    groupListenerRef.current = onSnapshot(groupRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === 'ended') {
           clearGroupState();
           return;
        }
        setDestination(data.destination);
        setGroupLocked(data.locked);
      }
    });

    // 2. Members Listener
    const membersRef = collection(db, 'groups', activeGroup.groupId, 'members');
    membersListenerRef.current = onSnapshot(membersRef, (snapshot) => {
      const membersData = [];
      snapshot.forEach(doc => {
        membersData.push({ uid: doc.id, ...doc.data() });
      });
      setMembers(membersData);
      
      // Update my own role if changed
      if (user) {
        const me = membersData.find(m => m.uid === user.uid);
        if (me) setUserRole(me.role);
        else clearGroupState(); // I was removed
      }
    });

    // 3. Messages Listener
    const messagesRef = collection(db, 'groups', activeGroup.groupId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    messagesListenerRef.current = onSnapshot(q, (snapshot) => {
      const msgsData = [];
      snapshot.forEach(doc => {
        msgsData.push({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate() || new Date() });
      });
      setMessages(msgsData);
    });

    return () => {
      if (groupListenerRef.current) groupListenerRef.current();
      if (membersListenerRef.current) membersListenerRef.current();
      if (messagesListenerRef.current) messagesListenerRef.current();
    };
  }, [activeGroup?.groupId, user?.uid]);

  const createGroup = async (groupData) => {
    if (!user) return null;
    
    const groupId = `grp-${Date.now()}`;
    const groupCode = groupData.code || generateCode();
    
    const newGroup = {
      groupId,
      groupCode: groupCode.toUpperCase(),
      groupName: groupData.groupName || 'Friend Group',
      adminId: user.uid,
      destination: groupData.destination || null,
      createdAt: serverTimestamp(),
      memberCount: 1,
      status: 'active',
      locked: false,
    };

    // Save group to Firestore
    await setDoc(doc(db, 'groups', groupId), newGroup);
    
    // Save admin to members subcollection
    const memberData = {
      username: user.username,
      profileImage: user.profileImage || null,
      role: 'admin',
      status: 'started',
      location: null,
      eta: null,
      distance: null,
      speed: 0,
      isOnline: true,
      joinedAt: serverTimestamp()
    };
    await setDoc(doc(db, 'groups', groupId, 'members', user.uid), memberData);

    setActiveGroup(newGroup);
    return newGroup;
  };

  const joinGroup = async (code) => {
    if (!user) return null;
    
    const upperCode = code.toUpperCase();
    
    // Find group by code
    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, where('groupCode', '==', upperCode), where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const groupDoc = querySnapshot.docs[0];
    const groupData = { groupId: groupDoc.id, ...groupDoc.data() };
    
    if (groupData.locked) throw new Error("This group is locked by the admin.");

    // Add user to members subcollection
    const memberData = {
      username: user.username,
      profileImage: user.profileImage || null,
      role: 'member',
      status: 'started',
      location: null,
      eta: null,
      distance: null,
      speed: 0,
      isOnline: true,
      joinedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'groups', groupData.groupId, 'members', user.uid), memberData);
    
    // Increment member count (ideally in a transaction, simplified here)
    await updateDoc(doc(db, 'groups', groupData.groupId), {
      memberCount: groupData.memberCount + 1
    });

    setActiveGroup(groupData);
    return groupData;
  };

  const sendMessage = async (text, type = 'text') => {
    if (!activeGroup || !user) return;
    
    const messagesRef = collection(db, 'groups', activeGroup.groupId, 'messages');
    await addDoc(messagesRef, {
      senderId: user.uid,
      senderName: user.username || 'User',
      text,
      type,
      timestamp: serverTimestamp()
    });
  };

  const removeMember = async (uid) => {
    if (!activeGroup) return;
    await deleteDoc(doc(db, 'groups', activeGroup.groupId, 'members', uid));
    const groupRef = doc(db, 'groups', activeGroup.groupId);
    const snap = await getDoc(groupRef);
    if(snap.exists()){
      await updateDoc(groupRef, { memberCount: Math.max(0, snap.data().memberCount - 1) });
    }
  };

  const updateMemberStatus = async (uid, status) => {
    if (!activeGroup) return;
    await updateDoc(doc(db, 'groups', activeGroup.groupId, 'members', uid), { status });
  };

  const changeDestination = async (dest) => {
    if (!activeGroup) return;
    await updateDoc(doc(db, 'groups', activeGroup.groupId), { destination: dest });
  };

  const endGroup = async () => {
    if (!activeGroup) return;
    await updateDoc(doc(db, 'groups', activeGroup.groupId), { status: 'ended' });
    clearGroupState();
  };

  const lockGroup = async () => {
    if (!activeGroup) return;
    await updateDoc(doc(db, 'groups', activeGroup.groupId), { locked: true });
  };
  
  const unlockGroup = async () => {
    if (!activeGroup) return;
    await updateDoc(doc(db, 'groups', activeGroup.groupId), { locked: false });
  };

  const startLocationTracking = () => {
    if (locationStopRef.current || !activeGroup || !user) return;

    locationStopRef.current = startTracking(
      async (pos) => {
        setMyLocation(pos);
        
        // Find my current record in state to check status
        const myRecord = members.find(m => m.uid === user.uid) || {};
        if (myRecord.status === 'arrived') return;

        const dest = destination;
        let status = myRecord.status || 'started';
        let distKm = 0;
        let eta = 0;

        if (dest && dest.lat && dest.lng) {
          if (isAtDestination(pos.lat, pos.lng, dest.lat, dest.lng, 50)) {
            status = 'arrived';
          } else {
            distKm = calcDistance(pos.lat, pos.lng, dest.lat, dest.lng);
            eta = calcETA(distKm, pos.speed || 30);
            
            if (myLastLocationRef.current) {
              const detectedStatus = detectStatus(
                pos.speed, 
                myLastLocationRef.current.lat, 
                myLastLocationRef.current.lng, 
                pos.lat, 
                pos.lng, 
                myLastMovedTimeRef.current
              );
              
              if (detectedStatus !== status && status !== 'delayed') {
                status = detectedStatus;
              }
              
              if (detectedStatus === 'stopped' && myRecord.status === 'moving') {
                setFakeAlert('You haven\'t moved but claim to be on the way!');
              } else {
                setFakeAlert(null);
              }
              
              if (detectedStatus === 'moving') {
                myLastMovedTimeRef.current = Date.now();
              }
            }
          }
        }
        
        myLastLocationRef.current = pos;

        // Push update to Firestore
        try {
          const memberRef = doc(db, 'groups', activeGroup.groupId, 'members', user.uid);
          await updateDoc(memberRef, {
            location: pos,
            speed: pos.speed || 0,
            distance: distKm,
            eta,
            status,
            lastUpdate: serverTimestamp()
          });
        } catch (error) {
          console.error("Error updating location to Firestore:", error);
        }
      },
      (err) => {
        console.warn('Location tracking error:', err);
      }
    );
  };

  const arrivedCount = members.filter(m => m.status === 'arrived').length;
  const delayedCount = members.filter(m => m.status === 'delayed' || m.status === 'stopped').length;
  const movingCount = members.filter(m => m.status === 'moving').length;

  return (
    <GroupContext.Provider value={{
      activeGroup, members, messages, userRole, destination, myLocation,
      groupLocked, fakeAlert,
      createGroup, joinGroup, sendMessage, removeMember, updateMemberStatus,
      changeDestination, endGroup, lockGroup, unlockGroup,
      startLocationTracking, stopLocationTracking,
      arrivedCount, delayedCount, movingCount,
    }}>
      {children}
    </GroupContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGroup() {
  return useContext(GroupContext);
}
