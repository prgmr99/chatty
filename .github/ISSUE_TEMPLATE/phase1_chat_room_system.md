---
name: Phase 1 - Chat Room System
about: Implementation of multi-room chat functionality
title: '[v1.1] Implement Chat Room System'
labels: enhancement, phase-1, v1.1
assignees: ''
---

## 🎯 Feature Overview

Implement multi-room chat system to support user group separation. This is Phase 1 of the project roadmap (v1.1).

## Goals

**Primary Goal:** Enable users to create, join, and switch between multiple chat rooms

**Secondary Goals:**
- Organize conversations by topic/team
- Scale to support multiple concurrent rooms
- Maintain room-specific user lists

## Requirements

### Functional Requirements

- [ ] Users can create new chat rooms
- [ ] Users can delete rooms (room creator only)
- [ ] Users can view list of available rooms
- [ ] Users can search/filter rooms
- [ ] Users can switch between rooms
- [ ] Each room maintains its own user list
- [ ] Messages are room-specific

### Technical Requirements

- [ ] Room state management on server
- [ ] Room persistence (in-memory for v1.1)
- [ ] WebSocket room subscriptions
- [ ] Scalable room data structure
- [ ] Room ID generation and validation

## Implementation Plan

### 1. Backend Changes

**Files to create:**
- `server/roomManager.js` - Room management logic
  - Room creation/deletion
  - User join/leave room
  - Room list management

**Files to modify:**
- `server/index.js`
  - Add room-based message routing
  - Integrate roomManager
  - Update WebSocket event handlers

**Key changes:**
```javascript
// New data structure
rooms = Map<roomId, {
  id: string,
  name: string,
  createdBy: string,
  createdAt: timestamp,
  users: Set<WebSocket>
}>

// New message types
- 'create-room'
- 'delete-room'
- 'join-room'
- 'leave-room'
- 'list-rooms'
```

### 2. Frontend Changes

**Files to create:**
- `public/components/roomList.js` - Room list UI component
- `public/components/roomManager.js` - Room management UI

**Files to modify:**
- `public/app.js`
  - Add room state management
  - Handle room-related events
  - Update message sending to include roomId
- `public/index.html`
  - Add room list sidebar
  - Add create room button
  - Add room search input
- `public/styles.css`
  - Style room list
  - Room switching animations

**Key UI components:**
- Room list panel (left sidebar)
- Active room indicator
- Create room modal/form
- Room search/filter
- Room-specific user list

### 3. Database/Storage (Future)

For v1.1, use in-memory storage. Plan for:
- [ ] Room data persistence (v1.2+)
- [ ] Room history (v1.2+)
- [ ] Default rooms on server start

### 4. Testing

**Unit Tests:**
- [ ] roomManager.createRoom()
- [ ] roomManager.deleteRoom()
- [ ] roomManager.addUser()
- [ ] roomManager.removeUser()
- [ ] Room ID validation

**Integration Tests:**
- [ ] Create room flow (WebSocket)
- [ ] Join room flow
- [ ] Message broadcasting within room
- [ ] User list updates per room

**Manual Testing:**
- [ ] Create multiple rooms
- [ ] Switch between rooms
- [ ] Send messages in different rooms
- [ ] Verify message isolation between rooms
- [ ] Delete room functionality
- [ ] Multiple users in multiple rooms

## Acceptance Criteria

✅ **Must Have:**
- [ ] Users can create rooms with custom names
- [ ] Users can see list of all available rooms
- [ ] Users can join/leave rooms
- [ ] Messages only appear in the room they were sent
- [ ] Each room shows its own user list
- [ ] Room creator can delete their room
- [ ] UI clearly shows which room is active

✅ **Quality:**
- [ ] No memory leaks when rooms are created/deleted
- [ ] WebSocket connections properly managed per room
- [ ] Error handling for edge cases (room not found, etc.)
- [ ] Responsive UI updates when switching rooms

✅ **Documentation:**
- [ ] Code comments for room management logic
- [ ] README updated with room feature instructions
- [ ] API documentation for new message types

## Estimated Timeline

**Expected Duration:** 2-3 weeks

**Breakdown:**
- Week 1: Backend implementation and testing
- Week 2: Frontend UI and integration
- Week 3: Testing, bug fixes, documentation

## Dependencies

**Depends on:**
- None (builds on current v1.0)

**Blocks:**
- Phase 2: Message Persistence (needs room context)

## Additional Notes

### Design Considerations

1. **Room Naming:**
   - Min length: 2 characters
   - Max length: 50 characters
   - Allowed characters: alphanumeric, spaces, hyphens

2. **Default Behavior:**
   - Auto-create "General" room on server start
   - New users auto-join "General" room
   - Can't delete "General" room

3. **Scalability:**
   - Plan for 100+ concurrent rooms
   - Efficient room lookup (Map data structure)
   - Consider room limits per user (v1.2+)

### Future Enhancements (v1.2+)
- Private/password-protected rooms
- Room categories/tags
- Room capacity limits
- Room moderators
- Room descriptions

### Related Issues
- TBD

### References
- WebSocket room pattern: [Socket.io Rooms](https://socket.io/docs/v4/rooms/)
- Chat room UX best practices
