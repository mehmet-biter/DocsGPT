import React, { useState, useEffect, useRef } from 'react';
import dinoGif from '../assets/dino.gif';
import dinoStable from '../assets/dino-stable.png';

const Ball: React.FC<BallProps> = ({ onCollision, dinoRef }) => {
  const [position, setPosition] = useState({
    top: 100,
    left: window.innerWidth - 800,
  });
  const [velocity, setVelocity] = useState({ x: -5, y: 5 });
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0.5 });

  const checkCollision = (ballRect: DOMRect, dinoRect: DOMRect) => {
    return (
      ballRect.left < dinoRect.right &&
      ballRect.right > dinoRect.left &&
      ballRect.top < dinoRect.bottom &&
      ballRect.bottom > dinoRect.top
    );
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setVelocity((prev) => ({
        x: prev.x + acceleration.x,
        y: prev.y + acceleration.y,
      }));

      setPosition((prev) => ({
        top: prev.top + velocity.y,
        left: prev.left + velocity.x,
      }));

      if (dinoRef.current) {
        const dinoRect = dinoRef.current.getBoundingClientRect();
        const ballRect = {
          top: position.top,
          right: position.left + 16,
          bottom: position.top + 16,
          left: position.left,
        };

        if (checkCollision(ballRect, dinoRect)) {
          setVelocity((prev) => ({ ...prev, y: -Math.abs(prev.y) }));
          onCollision();
        }
      }

      if (position.top <= 0) {
        setVelocity((prev) => ({ ...prev, y: Math.abs(prev.y) }));
      }

      if (position.top >= window.innerHeight - 16) {
        setVelocity((prev) => ({ ...prev, y: -Math.abs(prev.y) }));
      }

      if (position.left <= 0) {
        setVelocity((prev) => ({ ...prev, x: Math.abs(prev.x) }));
      }

      if (position.left >= window.innerWidth - 16) {
        setVelocity((prev) => ({ ...prev, x: -Math.abs(prev.x) }));
      }
    }, 20);

    return () => {
      clearInterval(intervalId);
    };
  }, [
    position.top,
    position.left,
    velocity,
    acceleration,
    dinoRef,
    onCollision,
  ]);

  return (
    <div
      className="absolute z-50 h-4 w-4 rounded-full bg-red-500"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
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
        moveLeft();
      }
      if (keyStates.current['d']) {
        moveRight();
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
    if (event.key === 'a' || event.key === 'd') {
      setIsMoving(true);
    }
  };

  const handleKeyUp = (event: KeyboardEvent): void => {
    keyStates.current[event.key] = false;
    if (event.key === 'a' || event.key === 'd') {
      if (!keyStates.current['a'] && !keyStates.current['d']) {
        setIsMoving(false);
      }
    }
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
