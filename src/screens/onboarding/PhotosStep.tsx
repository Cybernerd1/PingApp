import React, { useCallback, useState } from 'react';
import { PhotoManager } from '../../ui/PhotoManager';
import { StepLayout } from './StepLayout';

interface Props {
  step: number;
  total: number;
  onBack: () => void;
  onDone: () => void;
}

/** S6 — up to 6 photos; first one is the profile picture. */
export const PhotosStep: React.FC<Props> = ({ step, total, onBack, onDone }) => {
  const [state, setState] = useState({ count: 0, busy: false });
  const onChange = useCallback((s: { count: number; busy: boolean }) => setState(s), []);
  return (
    <StepLayout
      step={step}
      total={total}
      title="Add your best photos"
      subtitle="Add at least 1. Tap a photo to make it your main picture."
      onBack={onBack}
      onNext={onDone}
      nextDisabled={state.count < 1 || state.busy}
    >
      <PhotoManager onChange={onChange} />
    </StepLayout>
  );
};
