import Header from './Header';
import PaperGrid from './PaperGrid';
import RegistrationMotion from './RegistrationMotion';
import { innerPaletteItems } from '@/lib/palette';

/**
 * The shared frame for every page that is not the homepage: the drifting paper
 * ground, the retracting header with the jump-to palette, and the motion
 * engine that drives the reveals.
 *
 * Inner pages used to carry only a back link, which meant that from a lab
 * instrument the only way anywhere else was the browser's back button. With
 * this, every page is two keystrokes from every other one.
 */
export default function SiteChrome() {
  return (
    <>
      <PaperGrid />
      <Header paletteItems={innerPaletteItems()} inner />
      <RegistrationMotion />
    </>
  );
}
