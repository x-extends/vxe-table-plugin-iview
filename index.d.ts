import VXETable from 'vxe-table'

export interface VXETablePluginStatic {
  install(xTable: typeof VXETable): void;
}

/**
 * vxe-table renderer plugins for iview.
 */
declare var VXETablePluginIView: VXETablePluginStatic;

export default VXETablePluginIView;