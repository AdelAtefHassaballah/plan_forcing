import React from 'react';
import {
  Coffee,
  Footprints,
  Film,
  Sparkles,
  Sun,
  Calendar,
  CalendarDays,
  Clock,
  Sunrise,
  SunMedium,
  Sunset,
  Moon,
  HelpCircle,
  Ban,
  HeartHandshake,
  Brain,
  Heart,
  Smile,
} from 'lucide-react';

interface OptionIconProps {
  name?: string;
  className?: string;
}

export const OptionIcon: React.FC<OptionIconProps> = ({ name, className = 'w-4 h-4' }) => {
  switch (name?.toLowerCase()) {
    case 'coffee':
      return <Coffee className={className} />;
    case 'footprints':
      return <Footprints className={className} />;
    case 'film':
      return <Film className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'sun':
      return <Sun className={className} />;
    case 'calendar':
      return <Calendar className={className} />;
    case 'calendardays':
      return <CalendarDays className={className} />;
    case 'clock':
      return <Clock className={className} />;
    case 'sunrise':
      return <Sunrise className={className} />;
    case 'sunmedium':
      return <SunMedium className={className} />;
    case 'sunset':
      return <Sunset className={className} />;
    case 'moon':
      return <Moon className={className} />;
    case 'helpcircle':
      return <HelpCircle className={className} />;
    case 'ban':
      return <Ban className={className} />;
    case 'hearthandshake':
      return <HeartHandshake className={className} />;
    case 'brain':
      return <Brain className={className} />;
    case 'heart':
      return <Heart className={className} />;
    default:
      return <Smile className={className} />;
  }
};
