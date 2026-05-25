import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { mockMembers, mockMessages, mockGroups, DESTINATION } from '../data/mockData';
import { startTracking, stopTracking as locStopTracking, calcDistance, calcETA, detectStatus, isAtDestination } from '../services/locationService';

const GroupContext = createContext(null);

function generateCode(length = 7) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function GroupProvider({ children }) {
  const [activeGroup, setActiveGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'member' | 'viewer'
  const [destination, setDestination] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [groupLocked, setGroupLocked] = useState(false);
  const [fakeAlert, setFakeAlert] = useState(null);
  const locationStopRef = useRef(null);
  const simulationRef = useRef(null);
  const myLastLocationRef = useRef(null);
  const myLastMovedTimeRef = useRef(Date.now());

  // Simulate live movement of OTHER members
  useEffect(() => {
    if (!activeGroup) return;
    simulationRef.current = setInterval(() => {
      setMembers(prev =>
        prev.map(m => {
          if (m.uid === 'user-001') return m; // Skip current user (handled by real GPS)
          if (m.status === 'arrived') return m;
          const dest = destination || DESTINATION;
          const latDiff = dest.lat - m.location.lat;
          const lngDiff = dest.lng - m.location.lng;
          const dist = calcDistance(m.location.lat, m.location.lng, dest.lat, dest.lng);
          if (dist < 0.05) {
            return { ...m, status: 'arrived', eta: 0, distance: 0, speed: 0 };
          }
          const speed = m.status === 'stopped' ? 0 : m.status === 'slow' ? 0.0002 : 0.0005;
          return {
            ...m,
            location: {
              lat: m.location.lat + latDiff * speed + (Math.random() - 0.5) * 0.0002,
              lng: m.location.lng + lngDiff * speed + (Math.random() - 0.5) * 0.0002,
            },
            distance: Math.max(0, dist - speed * 100),
            eta: Math.max(0, Math.round(dist / (m.speed || 30) * 60)),
          };
        })
      );
    }, 3000);
    return () => clearInterval(simulationRef.current);
  }, [activeGroup, destination]);

  const createGroup = (groupData) => {
    const group = {
      groupId: `grp-${Date.now()}`,
      groupCode: groupData.code || generateCode(),
      adminId: 'user-001',
      createdAt: new Date(),
      memberCount: 1,
      status: 'active',
      locked: false,
      ...groupData,
    };
    setActiveGroup(group);
    setMembers([...mockMembers]);
    setMessages([...mockMessages]);
    setDestination(groupData.destination || DESTINATION);
    setUserRole('admin');
    setGroupLocked(false);
    return group;
  };

  const joinGroup = (code, role = 'member') => {
    const found = mockGroups.find(g => g.groupCode === code.toUpperCase());
    if (!found && code.length < 4) return null;
    const group = found || {
      groupId: `grp-joined-${Date.now()}`,
      groupName: 'Friend Group',
      groupCode: code.toUpperCase(),
      adminId: 'user-002',
      destination: DESTINATION,
      createdAt: new Date(),
      memberCount: mockMembers.length,
      status: 'active',
    };
    setActiveGroup(group);
    setMembers([...mockMembers]);
    setMessages([...mockMessages]);
    setDestination(group.destination || DESTINATION);
    setUserRole(role);
    setGroupLocked(false);
    return group;
  };

  const sendMessage = (text, type = 'text') => {
    const msg = {
      id: `msg-${Date.now()}`,
      senderId: 'user-001',
      senderName: 'Arun Kumar',
      text,
      timestamp: new Date(),
      type,
    };
    setMessages(prev => [...prev, msg]);
  };

  const removeMember = (uid) => {
    setMembers(prev => prev.filter(m => m.uid !== uid));
  };

  const updateMemberStatus = (uid, status) => {
    setMembers(prev => prev.map(m => m.uid === uid ? { ...m, status } : m));
  };

  const changeDestination = (dest) => {
    setDestination(dest);
  };

  const endGroup = () => {
    setActiveGroup(null);
    setMembers([]);
    setMessages([]);
    setDestination(null);
    setUserRole(null);
  };

  const startLocationTracking = () => {
    // Make sure we don't start multiple trackers
    if (locationStopRef.current) return;

    locationStopRef.current = startTracking(
      (pos) => {
        const dest = destination || DESTINATION;
        
        // 1. Update our local state
        setMyLocation(pos);

        // 2. Detect movement status and update our member info in the group
        setMembers(prev => prev.map(m => {
          if (m.uid === 'user-001') {
            if (m.status === 'arrived') return m;

            // Check arrival
            if (isAtDestination(pos.lat, pos.lng, dest.lat, dest.lng, 50)) {
              return { ...m, location: pos, status: 'arrived', eta: 0, distance: 0, speed: 0 };
            }

            // Detect real status
            const distKm = calcDistance(pos.lat, pos.lng, dest.lat, dest.lng);
            const eta = calcETA(distKm, pos.speed || 30);
            
            let status = m.status;
            
            if (myLastLocationRef.current) {
              const detectedStatus = detectStatus(
                pos.speed, 
                myLastLocationRef.current.lat, 
                myLastLocationRef.current.lng, 
                pos.lat, 
                pos.lng, 
                myLastMovedTimeRef.current
              );
              
              // Only override with 'moving' or 'slow' if the user hasn't manually set something like 'delayed'
              if (detectedStatus !== m.status && m.status !== 'delayed') {
                status = detectedStatus;
              }
              
              // Fake detection alert
              if (detectedStatus === 'stopped' && m.status === 'moving') {
                setFakeAlert('You haven\'t moved but claim to be on the way!');
              } else {
                setFakeAlert(null);
              }
              
              if (detectedStatus === 'moving') {
                myLastMovedTimeRef.current = Date.now();
              }
            }
            
            myLastLocationRef.current = pos;

            return {
              ...m,
              location: pos,
              speed: pos.speed,
              distance: distKm,
              eta,
              status
            };
          }
          return m;
        }));
      },
      (err) => {
        console.warn('Location tracking error:', err);
      }
    );
  };

  const stopLocationTracking = () => {
    if (locationStopRef.current) {
      locationStopRef.current(); // Calls the cleanup function returned by startTracking
      locationStopRef.current = null;
    }
  };


  const lockGroup = () => setGroupLocked(true);
  const unlockGroup = () => setGroupLocked(false);

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

export function useGroup() {
  return useContext(GroupContext);
}
