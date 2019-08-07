export interface VXETablePluginIViewStatic {
  install(vue: typeof Vue): void;
}

/**
 * vxe-table renderer plugins for iview.
 */
declare var VXETablePluginIView: VXETablePluginIViewStatic;

export default VXETablePluginIView;