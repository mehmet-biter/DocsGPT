import React, { useState, useEffect, useRef } from 'react';
import dinoGif from '../assets/dino.gif';
import dinoStable from '../assets/dino-stable.png';

const Ball: React.FC<BallProps> = ({ onCollision, dinoRef }) => {
  const [ballState, setBallState] = useState({
    position: {
      top: 100,
      left: window.innerWidth - 800,
    },
    velocity: { x: -5, y: 5 },
    acceleration: { x: 0, y: 0.5 },
  });

  const checkCollision = (ballRect: DOMRect, dinoRect: DOMRect) => {
    return (
      ballRect.left < dinoRect.right &&
      ballRect.right > dinoRect.left &&
      ballRect.top < dinoRect.bottom &&
      ballRect.bottom > dinoRect.top
    );
  };

  const updateBall = () => {
    setBallState((prevState) => {
      const { position, velocity, acceleration } = prevState;
      const newVelocity = {
        x: velocity.x + acceleration.x * 0.8,
        y: velocity.y + acceleration.y * 0.8,
      };
      const newPosition = {
        top: position.top + newVelocity.y,
        left: position.left + newVelocity.x,
      };
      // Collision detection with dino
      if (dinoRef.current) {
        const dinoRect = dinoRef.current.getBoundingClientRect();
        const ballRect = {
          top: newPosition.top,
          right: newPosition.left + 16,
          bottom: newPosition.top + 16,
          left: newPosition.left,
        };
        if (checkCollision(ballRect, dinoRect)) {
          let randomFactor = Math.random() * 0.5 + 0.5;
          newVelocity.y = -Math.abs(newVelocity.y + randomFactor + 1) * 1.5;
          if (newVelocity.x < 0) {
            randomFactor = -randomFactor;
          }
          newVelocity.x = newVelocity.x + randomFactor;
          onCollision();
        }
      }
      if (newPosition.top <= 0) {
        newVelocity.y = -newVelocity.y * 0.8;
      } else if (newPosition.top >= window.innerHeight - 16) {
        newPosition.top = window.innerHeight - 16;
        newVelocity.y = -newVelocity.y * 0.8;
      }

      // Collision detection with left and right of the screen
      if (newPosition.left <= 0 || newPosition.left >= window.innerWidth - 16) {
        newVelocity.x = -newVelocity.x * 0.8;
      }
      // give friction to the ball
      newVelocity.x *= 0.99;
      newVelocity.y *= 0.99;

      return {
        position: newPosition,
        velocity: newVelocity,
        acceleration,
      };
    });
    requestAnimationFrame(updateBall);
  };

  useEffect(() => {
    requestAnimationFrame(updateBall);
  }, []);

  return (
    <div
      className="absolute z-50 h-4 w-4 rounded-full bg-red-500"
      style={{
        top: `${ballState.position.top}px`,
        left: `${ballState.position.left}px`,
      }}
    />
  );
};

interface Position {
  top: number;
  left: number;
  velocityY: number;
}

const GRAVITY = 1;
const JUMP_STRENGTH = 20;
const MOVE_DISTANCE = 10; // Distance to move left or right
const GROUND_LEVEL = window.innerHeight - 30; // Adjust this according to the size of your character or screen

const Dino: React.FC = () => {
  const dinoRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({
    top: GROUND_LEVEL,
    left: 50,
    velocityY: 0,
  });
  const [isMoving, setIsMoving] = useState<boolean>(false); // New state for movement
  const [facingRight, setFacingRight] = useState<boolean>(true); // New state for direction
  const intervalRef = useRef<number | null>(null);
  const keyStates = useRef<{ [key: string]: boolean }>({});
  const isJumpingRef = useRef<boolean>(false);
  const [score, setScore] = useState(0);

  const startJump = () => {
    if (!isJumpingRef.current) {
      isJumpingRef.current = true;
      setPosition((prev) => ({
        ...prev,
        velocityY: -JUMP_STRENGTH,
      }));
    }
  };
  const checkCollision = (ballRect: DOMRect, dinoRect: DOMRect) => {
    return (
      ballRect.left < dinoRect.right &&
      ballRect.right > dinoRect.left &&
      ballRect.top < dinoRect.bottom &&
      ballRect.bottom > dinoRect.top
    );
  };

  const handleBallCollision = () => {
    setScore((prev) => prev + 1);
  };

  const moveLeft = () => {
    setFacingRight(false);
    setPosition((prev) => ({
      ...prev,
      left: Math.max(prev.left - MOVE_DISTANCE, 0),
    }));
  };

  const moveRight = () => {
    setFacingRight(true);
    setPosition((prev) => ({
      ...prev,
      left: Math.min(prev.left + MOVE_DISTANCE, window.innerWidth - 50),
    }));
  };

  const applyPhysics = () => {
    setPosition((prev) => {
      const newPos = { ...prev };
      newPos.top += newPos.velocityY;
      newPos.velocityY += GRAVITY;
      if (keyStates.current['a']) {
        newPos.left = Math.max(newPos.left - MOVE_DISTANCE, 0);
        setFacingRight(false);
      }
      if (keyStates.current['d']) {
        newPos.left = Math.min(
          newPos.left + MOVE_DISTANCE,
          window.innerWidth - 50,
        );
        setFacingRight(true);
      }
      if (newPos.top >= GROUND_LEVEL) {
        newPos.top = GROUND_LEVEL;
        newPos.velocityY = 0;
        isJumpingRef.current = false;
      }
      return newPos;
    });
  };

  useEffect(() => {
    intervalRef.current = window.setInterval(applyPhysics, 20);
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent): void => {
    keyStates.current[event.key] = true;
    if (event.key === 'w') {
      startJump();
    }
  };

  const handleKeyUp = (event: KeyboardEvent): void => {
    keyStates.current[event.key] = false;
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div>
      <div
        ref={dinoRef}
        className="absolute z-50 select-none text-5xl"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: `scale(2) ${facingRight ? '' : 'scaleX(-1)'}`, // Apply horizontal flip if facing left
        }}
      >
        {isMoving ? (
          <img src={dinoGif} alt="Dino" />
        ) : (
          <img src={dinoStable} alt="Dino" />
        )}
      </div>
      <Ball onCollision={handleBallCollision} dinoRef={dinoRef} />
      <div className="absolute top-0 z-50 text-2xl">Score: {score}</div>
    </div>
  );
};

export default Dino;
