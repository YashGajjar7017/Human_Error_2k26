const { expect } = require('chai');
const { handleJob } = require('../src/worker');
const path = require('path');

describe('worker.handleJob', () => {
  it('handles a job and sends result via sink', async () => {
    const req = { jobId: 'job-1', command: 'echo hello' };
    const source = (async function*(){ yield Buffer.from(JSON.stringify(req)); })();
    let sent = null;
    const fakeStream = {
      source,
      sink: async (buffers) => { sent = Buffer.concat(buffers.map(b => Buffer.isBuffer(b) ? b : Buffer.from(b))).toString(); }
    };
    const fakeExec = (cmd, opts, cb) => {
      if (typeof opts === 'function') { cb = opts; opts = {}; }
      cb(null, 'hello\n', '');
    };
    await handleJob({ stream: fakeStream }, { exec: fakeExec, cacheDir: path.join(__dirname, '..', 'cache'), cfg: {} });
    expect(sent).to.be.a('string');
    const res = JSON.parse(sent);
    expect(res).to.have.property('jobId', 'job-1');
    expect(res).to.have.property('stdout').that.includes('hello');
  });
});
