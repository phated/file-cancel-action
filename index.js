const core = require('@actions/core');
const github = require('@actions/github');
const glob = require('@actions/glob');

async function run() {
  const token = core.getInput('token', { required: true });
  let exists = core.getInput('exists');
  let notExists = core.getInput('not-exists');

  const octokit = github.getOctokit(token);

  try {
    if (!exists && !notExists) {
      throw new Error('Either `exists` or `not-exists` input is required.');
    }

    let existsGlobber;
    if (exists) {
      exists = JSON.parse(exists);
      if (Array.isArray(exists)) {
        exists = exists.join('\n');
      }
      if (typeof exists !== 'string') {
        throw new Error('The value of `exists` must be a string or array.');
      }
      existsGlobber = await glob.create(exists);
    }

    const existsFiles = await existsGlobber.glob();
    if (existsFiles.length > 0) {
      await octokit.rest.actions.cancelWorkflowRun({
        ...github.context.repo,
        run_id: github.context.runId
      });
    }

    let notExistsGlobber;
    if (notExists) {
      notExists = JSON.parse(notExists);
      if (Array.isArray(notExists)) {
        notExists = notExists.join('\n');
      }
      if (typeof notExists !== 'string') {
        throw new Error('The value of `not-exists` must be a string or array.');
      }
      notExistsGlobber = await glob.create(notExists);
    }

    const notExistsFiles = await notExistsGlobber.glob();
    if (notExistsFiles.length === 0) {
      await octokit.rest.actions.cancelWorkflowRun({
        ...github.context.repo,
        run_id: github.context.runId
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
