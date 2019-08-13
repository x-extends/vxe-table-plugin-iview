import VXETable from 'vxe-table'

export interface VXETablePluginIViewStatic {
  install(xTable: typeof VXETable): void;
}

/**
 * vxe-table renderer plugins for iview.
 */
declare var VXETablePluginIView: VXETablePluginIViewStatic;

export default VXETablePluginIView;