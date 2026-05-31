import { createRoot, type Root } from 'react-dom/client';
import {
  type FeatureModule,
  type MountProps,
  CONTRACT_MAJOR,
} from '@harisumiran/platform';
import { App } from './App';

const featureModule: FeatureModule = {
  mount: async (props: MountProps) => {
    // Runtime guard: fail loud if the shell's contract version doesn't match.
    const [major] = props.contractVersion.split('.');
    if (Number(major) !== CONTRACT_MAJOR) {
      throw new Error(
        `Incompatible Sampark shell: contract v${props.contractVersion}, ` +
          `this app was built against v${CONTRACT_MAJOR}.x`,
      );
    }

    const root: Root = createRoot(props.container);
    root.render(<App {...props} />);
    return () => root.unmount();
  },
  metadata: {
    name: 'your-team-app', // replace with your team slug
    version: '0.0.1',
  },
};

export default featureModule;
