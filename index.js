const core = require('@actions/core');
const github = require('@actions/github');
const glob = require('@actions/glob');

async function run() {
  const token = core.getInput('token', { required: true });
  const exists = core.getInput('exists');
  const notExists = core.getInput('not-exists');

  const octokit = github.getOctokit(token);

  try {
    if (!exists && !notExists) {
      throw new Error('Either `exists` or `not-exists` input is required.');
    }

    if (exists) {
      const existsGlobber = await glob.create(exists);
      const existsFiles = await existsGlobber.glob();
      if (existsFiles.length > 0) {
        await octokit.rest.actions.cancelWorkflowRun({
          ...github.context.repo,
          run_id: github.context.runId
        });
      }
    }

    if (notExists) {
      const notExistsGlobber = await glob.create(notExists);
      const notExistsFiles = await notExistsGlobber.glob();
      if (notExistsFiles.length === 0) {
        await octokit.rest.actions.cancelWorkflowRun({
          ...github.context.repo,
          run_id: github.context.runId
        });
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
