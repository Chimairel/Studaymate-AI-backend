import { EssayRepository } from './src/repositories/essay.repository';
async function run() {
  const repo = new EssayRepository();
  try {
    await repo.findAll('test-user-id', {});
    console.log('SUCCESS');
  } catch(e) {
    console.error('ERROR:', e);
  }
}
run();
