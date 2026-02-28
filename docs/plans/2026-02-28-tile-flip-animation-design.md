# Tile Flip Animation Design

## Overview
Add flip and pinwheel animations when the user commits a move, with animations completing before the next turn begins.

## Requirements
- When "Commit Move" is pressed, trigger animations BEFORE calling nextTurn
- Two simultaneous animations:
  - **Flip**: Tan tiles (canMove: true) flip horizontally to become gray
  - **Pinwheel**: Green tiles (in validRows) rotate 540° and scale down to 0
- Duration: 500ms + 150ms buffer = 650ms total
- Console logs: "ANIMATION START", "ANIMATION END", "NEXT TURN TRIGGERED"
- Letters must not appear backwards during flip

## Architecture & Flow

### Overall Sequence
1. User presses "Commit Move" → calls `handleCommitMove()` (not `nextTurn` directly)
2. `handleCommitMove()` logs "ANIMATION START"
3. Tile components detect animation flags and run animations
4. After 650ms timeout, log "ANIMATION END"
5. Call `nextTurn()` and log "NEXT TURN TRIGGERED"

### Animation Coordination
- Use simple setTimeout with known duration (500ms animation + 150ms buffer)
- Set `isAnimating` state to prevent button clicks during animation
- No complex callback coordination needed

## Flip Animation Implementation

### Horizontal Flip (Y-axis rotation)
Following Reanimated flip card example:

1. Use `rotateY` shared value (0deg → 180deg)
2. Two faces rendered:
   - **Front face**: Tan tile with letter (visible at 0°)
   - **Back face**: Gray tile with letter (visible at 180°)
3. Both faces use `backfaceVisibility: 'hidden'`

### Styling
```javascript
frontStyle: {
  rotateY: rotateY.value + "deg",
  backfaceVisibility: 'hidden',
  position: 'absolute'
}

backStyle: {
  rotateY: (rotateY.value + 180) + "deg",
  backfaceVisibility: 'hidden',
  position: 'absolute'
}
```

### Animation Trigger
```javascript
useEffect(() => {
  if (shouldFlip) {
    rotateY.value = withTiming(180, {
      duration: 500,
      easing: Easing.out(Easing.cubic)
    });
  }
}, [shouldFlip]);
```

## Pinwheel Animation Implementation

### Rotate + Scale Down
For green tiles:

1. Two shared values:
   - `rotate`: 0deg → 540deg (1.5 rotations)
   - `scale`: 1 → 0
2. Apply both transformations simultaneously
3. Duration: 500ms with `Easing.out(Easing.cubic)`

### Animation Trigger
```javascript
useEffect(() => {
  if (shouldPinwheel) {
    rotate.value = withTiming(540, {
      duration: 500,
      easing: Easing.out(Easing.cubic)
    });
    scale.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.cubic)
    });
  }
}, [shouldPinwheel]);
```

### Styling
```javascript
transform: [
  { rotate: rotate.value + "deg" },
  { scale: scale.value }
]
```

## State Management

### New State in useGame.ts
```typescript
const [isAnimating, setIsAnimating] = useState(false);
```

### New Props for Tile Component
```typescript
interface TileProps {
  // ... existing props
  shouldFlip: boolean;      // true if tile.canMove
  shouldPinwheel: boolean;  // true if in validRows && !canMove
}
```

### handleCommitMove Function
```typescript
const handleCommitMove = () => {
  console.log('ANIMATION START');
  setIsAnimating(true);

  // Tiles detect their shouldFlip/shouldPinwheel props and animate

  setTimeout(() => {
    console.log('ANIMATION END');
    nextTurn();
    console.log('NEXT TURN TRIGGERED');
    setIsAnimating(false);
  }, 650); // 500ms animation + 150ms buffer
};
```

### Button Update
```typescript
<ThemedButton
  disabled={!validBoard || !!inMotion || isAnimating}
  onPress={handleCommitMove}
  // ... other props
>
  <Text>Commit Move</Text>
</ThemedButton>
```

## Implementation Notes

1. **Tile Component Changes:**
   - Add flip animation logic with front/back faces
   - Add pinwheel animation logic with rotate + scale
   - Use useEffect to detect prop changes and trigger animations
   - Reset animation state after completion

2. **Game Component Changes:**
   - Change button onPress from `nextTurn` to `handleCommitMove`
   - Add `isAnimating` to button disabled condition
   - Pass `shouldFlip` and `shouldPinwheel` props to Tile components

3. **useGame Hook Changes:**
   - Add `isAnimating` state
   - Add `handleCommitMove` function
   - Export `handleCommitMove` and `isAnimating`

## Testing
- Verify animations run before nextTurn is called
- Verify console logs appear in correct order
- Verify letters don't appear backwards during flip
- Verify button is disabled during animation
- Verify no visual glitches or state conflicts
