import { useEffect, useRef } from 'react';
import { HashLoader } from 'react-spinners';
import './index.css';
interface ProcessingLoadingInterface {
  text?: string;
  isLoading?: boolean;
}

const ProcessinLoading = ({
  text = 'Loading',
  isLoading = false,
}: ProcessingLoadingInterface) => {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaderElement = loaderRef.current;

    if (isLoading) {
      // Freeze the scroll and prevent user interaction
      if (loaderElement) {
        loaderElement.style.overflow = 'hidden';
        loaderElement.style.pointerEvents = 'none';
      }
    } else {
      // Unfreeze the scroll and re-enable user interaction
      if (loaderElement) {
        loaderElement.style.overflow = 'auto';
        loaderElement.style.pointerEvents = 'auto';
      }
    }
  }, [isLoading]);
  if (!isLoading) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900 bg-opacity-75">
      <div ref={loaderRef} className="processing-loader-container">
        <div
          className=" flex w-full flex-col items-center
         justify-center gap-2"
        >
          <HashLoader size={80} speedMultiplier={1} color={'#8C72F3'} />
          <h3>{text}</h3>
        </div>
      </div>
    </div>
  );
};

export default ProcessinLoading;
