export type ContractVersion = `${number}.${number}`;
export declare const CONTRACT_MAJOR: 1;
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}
export type PermissionKey = string;
export type CanFn = (key: PermissionKey) => boolean;
export type UnsubscribeFn = () => void;
export interface EventBus {
    emit<T = unknown>(event: string, payload?: T): void;
    on<T = unknown>(event: string, handler: (payload: T) => void): UnsubscribeFn;
}
export type NavigateFn = (path: string) => void;
export interface MountProps {
    container: HTMLElement;
    basePath: string;
    contractVersion: ContractVersion;
    user: User;
    can: CanFn;
    navigate: NavigateFn;
    events: EventBus;
    csrfToken: string;
}
export type UnmountFn = () => void | Promise<void>;
export interface FeatureModule {
    mount: (props: MountProps) => Promise<UnmountFn> | UnmountFn;
    metadata: {
        name: string;
        version: string;
    };
}
export interface ManifestEntry {
    slug: string;
    version: string;
    bundleUrl: string;
    routePrefix: string;
    requiredEntitlements: string[];
}
