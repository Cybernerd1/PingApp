import React, { useState } from 'react';
import { BackHandler } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../../api/profile';
import { locationApi } from '../../api/location';
import { GenderType, LocationCoordinates, UserProfile } from '../../api/types';
import { GoogleIdentity, ONBOARDING_ORDER, OnboardingStep } from '../../session/session';
import { getCurrentCoords, LocationPermissionDenied } from '../../services/locationService';
import { GenderStep } from './GenderStep';
import { BasicsStep, DobParts, dobToIso } from './BasicsStep';
import { InterestsStep } from './InterestsStep';
import { PhotosStep } from './PhotosStep';
import { PreferencesStep } from './PreferencesStep';

interface Props {
  initialStep: OnboardingStep;
  profile: UserProfile | null;
  identity: GoogleIdentity | null;
  onComplete: (profile: UserProfile | null) => void;
  /** Called when the user backs out of the very first step. */
  onExit?: () => void;
}

function isoToDob(iso?: string | null): DobParts {
  if (!iso) return { day: '', month: '', year: '' };
  const [y, m, d] = iso.slice(0, 10).split('-');
  return { day: d ?? '', month: m ?? '', year: y ?? '' };
}

/**
 * Onboarding wizard: Gender → Basics → Interests → Photos → Preferences.
 * Resumes at whichever step resolveSession() says is incomplete.
 */
export const OnboardingWizard: React.FC<Props> = ({ initialStep, profile, identity, onComplete, onExit }) => {
  const qc = useQueryClient();
  const total = ONBOARDING_ORDER.length;
  const [index, setIndex] = useState(Math.max(0, ONBOARDING_ORDER.indexOf(initialStep)));
  const step = ONBOARDING_ORDER[index];

  // Draft for the gender + basics steps (saved together on Basics → Next)
  const [gender, setGender] = useState<GenderType | null>(profile?.gender ?? null);
  const [fullName, setFullName] = useState(profile?.full_name ?? identity?.name ?? '');
  const [dob, setDob] = useState<DobParts>(isoToDob(profile?.birthdate));
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [coords, setCoords] = useState<LocationCoordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [interestNames, setInterestNames] = useState<string[]>(profile?.interests ?? []);

  const next = () => setIndex(i => Math.min(i + 1, total - 1));
  const back = () => (index === 0 ? onExit?.() : setIndex(i => i - 1));

  // Android hardware back walks the wizard instead of closing the app.
  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (index > 0) {
        setIndex(i => i - 1);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [index]);

  const locate = async () => {
    setLocating(true);
    setLocationError(null);
    try {
      setCoords(await getCurrentCoords());
    } catch (e) {
      setLocationError(
        e instanceof LocationPermissionDenied
          ? 'Location permission is off. Enable it in Settings to see people nearby.'
          : 'Couldn’t get your location. Make sure GPS is on and try again.',
      );
    } finally {
      setLocating(false);
    }
  };

  const saveBasics = async () => {
    const birthdate = dobToIso(dob);
    if (!gender || !birthdate) return;
    setSaving(true);
    setSaveError(null);

    const body = {
      full_name: fullName.trim(),
      birthdate,
      gender,
      bio: bio.trim() || undefined,
    };

    let res = await profileApi.createProfile(body);
    // Google sign-up pre-fills full_name → POST returns 409. Fall back to PUT.
    if (res.status === 'error' && res.code === 'CONFLICT') {
      const upd = await profileApi.updateProfile(body);
      res = upd.status === 'error' ? upd : { ...upd, data: { profile: upd.data.profile } };
    }
    if (res.status === 'error') {
      setSaving(false);
      setSaveError(res.details ? String(res.details) : res.message);
      return;
    }

    if (coords) {
      const loc = await locationApi.startLocationSharing(coords);
      if (loc.status === 'error') setLocationError(loc.message);
    }

    qc.invalidateQueries({ queryKey: ['userProfile'] });
    setSaving(false);
    next();
  };

  const finish = async () => {
    const res = await profileApi.getOwnProfile();
    qc.invalidateQueries({ queryKey: ['userProfile'] });
    qc.invalidateQueries({ queryKey: ['userPreferences'] });
    onComplete(res.status === 'success' ? res.data : profile);
  };

  switch (step) {
    case 'gender':
      return (
        <GenderStep
          step={1}
          total={total}
          value={gender}
          onChange={setGender}
          onNext={next}
          onSkip={() => {
            setGender('prefer_not_to_say');
            next();
          }}
        />
      );
    case 'basics':
      return (
        <BasicsStep
          step={2}
          total={total}
          fullName={fullName}
          onFullName={setFullName}
          email={identity?.email}
          dob={dob}
          onDob={setDob}
          bio={bio}
          onBio={setBio}
          coords={coords}
          locating={locating}
          locationError={locationError}
          onLocate={locate}
          onBack={back}
          onNext={saveBasics}
          saving={saving}
          error={saveError}
        />
      );
    case 'interests':
      return (
        <InterestsStep
          step={3}
          total={total}
          initialNames={interestNames}
          onBack={back}
          onDone={names => {
            setInterestNames(names);
            next();
          }}
        />
      );
    case 'photos':
      return <PhotosStep step={4} total={total} onBack={back} onDone={next} />;
    case 'preferences':
    default:
      return <PreferencesStep step={5} total={total} ownGender={gender} onBack={back} onDone={finish} />;
  }
};
