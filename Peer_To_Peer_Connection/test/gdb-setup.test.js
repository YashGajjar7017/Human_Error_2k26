const { expect } = require('chai');
const GDBCompiler = require('../../Engine_Execution/gdb-setup');

describe('GDBCompiler', () => {
  it('compileFromContent resolves when exec succeeds', async () => {
    const fakeExec = (cmd, cb) => cb(null, 'compiled', '');
    const compiler = new GDBCompiler({ exec: fakeExec });
    const res = await compiler.compileFromContent('int main(){return 0;}', 'c', 'out');
    expect(res).to.have.property('outputPath');
  });

  it('compileFromContent rejects when exec fails', async () => {
    const fakeExec = (cmd, cb) => cb(new Error('fail'), '', 'error');
    const compiler = new GDBCompiler({ exec: fakeExec });
    try {
      await compiler.compileFromContent('bad code', 'c', 'out');
      throw new Error('Expected failure');
    } catch (err) {
      expect(err).to.exist;
    }
  });
});
