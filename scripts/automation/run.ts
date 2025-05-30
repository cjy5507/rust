import { AppointmentService } from './AppointmentService';
import { IStore } from '../types';

function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('store/config JSON 파라미터가 필요합니다.');
    process.exit(1);
  }
  let store: IStore;
  try {
    store = JSON.parse(arg);
  } catch (e) {
    console.error('JSON 파싱 오류:', e);
    process.exit(1);
  }
  const service = new AppointmentService();
  service.handleStore(store);
}

main(); 