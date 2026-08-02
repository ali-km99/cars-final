export type StatusName = 'Ready' | 'Maintenance' | 'Shipping' | 'Sold'

const statusMeta: Record<StatusName, { color: string; label: string; icon: string }> = {
  Ready: { color: 'success', label: 'جاهزة', icon: 'mdi-check-circle' },
  Maintenance: { color: 'warning', label: 'تحت الصيانة', icon: 'mdi-wrench' },
  Shipping: { color: 'info', label: 'قيد الشحن', icon: 'mdi-truck-fast' },
  Sold: { color: 'error', label: 'مباعة', icon: 'mdi-tag-check' },
}

export function useCarStatus() {
  function getStatusMeta(name: string) {
    return statusMeta[name as StatusName] || { color: 'gray', label: name, icon: 'mdi-help-circle' }
  }

  return { getStatusMeta, statusMeta }
}
