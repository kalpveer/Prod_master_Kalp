/* eslint-disable */
/// <reference types="vite/client" />
declare module '*.glb';
declare module '*.png';

declare module 'meshline' {
  export const MeshLineGeometry: any;
  export const MeshLineMaterial: any;
}

import { ReactThreeFiber } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: ReactThreeFiber.Object3DNode<any, typeof import('meshline').MeshLineGeometry>;
      meshLineMaterial: ReactThreeFiber.Object3DNode<any, typeof import('meshline').MeshLineMaterial>;
    }
  }
}
