/**
 * Replays a submitted run against the authoritative scenario tree so scoring
 * can never be spoofed by a client sending a fabricated rubric_result.
 */
export function gradeRun(scenario, steps) {
  const rubricResult = {};
  for (const dim of scenario.rubric_dimensions) rubricResult[dim] = false;

  let nodeId = 'start';
  const pathTaken = [nodeId];

  for (const step of steps) {
    if (step.node_id !== nodeId) {
      throw new GradingError(`expected a choice at node "${nodeId}", got "${step.node_id}"`);
    }
    const node = scenario.nodes[nodeId];
    if (!node) throw new GradingError(`unknown node "${nodeId}"`);
    const option = node.options[step.option_index];
    if (!option) throw new GradingError(`invalid option index ${step.option_index} at node "${nodeId}"`);

    for (const [dim, value] of Object.entries(option.rubric_signal || {})) {
      if (value === true && dim in rubricResult) rubricResult[dim] = true;
    }

    if (option.next_node) {
      nodeId = option.next_node;
      pathTaken.push(nodeId);
    } else {
      nodeId = null;
      break;
    }
  }

  if (nodeId !== null) {
    throw new GradingError('run did not reach a terminal node');
  }

  const passedCount = Object.values(rubricResult).filter(Boolean).length;
  const threshold = scenario.pass_threshold?.count ?? Math.ceil(scenario.rubric_dimensions.length * 0.75);
  const passed = passedCount >= threshold;

  return { path_taken: pathTaken, rubric_result: rubricResult, passed, passed_count: passedCount, threshold };
}

export class GradingError extends Error {}
