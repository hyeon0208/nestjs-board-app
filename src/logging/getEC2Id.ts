import { exec } from 'child_process';

export async function getEC2Id(): Promise<string> {
  return new Promise((resolve) => {
    exec('ec2-metadata -i', (error, stdout, stderr) => {
      if (error) {
        if (error.message.includes('not found') || (error as any).code === 127)
          return resolve('unknown');
        return resolve('unknown');
      }
      if (stderr || !stdout) return resolve('unknown');

      try {
        const instanceId = stdout.trim().split(': ')[1];
        if (instanceId && instanceId.startsWith('i-'))
          return resolve(instanceId);
        resolve('unknown');
      } catch {
        resolve('unknown');
      }
    });
  });
}
