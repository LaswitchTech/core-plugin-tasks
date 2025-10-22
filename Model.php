<?php

// Import additionnal class into the global namespace
use \LaswitchTech\Core\Base\BaseModel;

class TasksModel extends BaseModel {

    /**
     * Constructor
     */
    public function __construct()
    {
        // Call the parent constructor
        parent::__construct();

        // Initialize the Model
        $this->init('tasks');
    }

    /**
     * Process a record
     *
     * @param array $record
     * @return array
     */
    protected function process(array $record): array
    {
        // Call the parent constructor
        $record = parent::process($record);

        // Decode the process
        if(!is_array($record['process'])){
            $record['process'] = json_decode($record['process'] ?? "[]", true);
        }

        // Return the processed record
        return $record;
    }

    /**
     * Apply Joins to the Query
     *
     * @param Query $Query
     * @return Query
     */
    protected function joins(object $Query): object
    {
        // Apply Joins
        $Query->join('assignedTo', 'users', 'id');

        return $Query;
    }

    /**
     * Update a record
     *
     * @param int $id
     * @param array $data
     * @return int
     */
    public function update(int $id, array $data): int
    {
        // Sanitize the Data
        foreach($data as $key => $value){

            // Add exceptions for specific fields
            if($key === 'process' && is_array($value)){

                // Loop through each step in the array
                foreach($value as $stepKey => $step){

                    // Sanitize the step
                    // Boolean values
                    $value[$stepKey]['isCompleted'] = filter_var($step['isCompleted'], FILTER_VALIDATE_BOOLEAN);

                    // Loop through each tasks in the array
                    foreach($step['tasks'] as $taskKey => $task){

                        // Sanitize the task
                        // Boolean values
                        $value[$stepKey]['tasks'][$taskKey]['isCompleted'] = filter_var($task['isCompleted'], FILTER_VALIDATE_BOOLEAN);
                        $value[$stepKey]['tasks'][$taskKey]['isDisabled'] = filter_var($task['isDisabled'], FILTER_VALIDATE_BOOLEAN);
                        // Integer values
                        $value[$stepKey]['tasks'][$taskKey]['cost'] = intval($task['cost'] ?? 0);
                        // String/null values
                        $value[$stepKey]['tasks'][$taskKey]['onComplete'] = $task['onComplete'] ? trim($task['onComplete']) : null;
                        $value[$stepKey]['tasks'][$taskKey]['value'] = $task['value'] ? trim($task['value']) : null;

                        // Check if the task is completed and if it is the last task in the last step
                        if($value[$stepKey]['tasks'][$taskKey]['isCompleted'] && count($value) === $stepKey && count($step['tasks']) === $taskKey){

                            // Set task as completed
                            $data['isCompleted'] = $value[$stepKey]['tasks'][$taskKey]['isCompleted'];
                            $data['completedOn'] = $value[$stepKey]['tasks'][$taskKey]['onComplete'];
                        }
                    }
                }
            }

            // Set the value back to the data array
            $data[$key] = $value;
        }

        // Call the parent update method
        return parent::update($id, $data);
    }

    /**
     * Create a new record and return the id
     *
     * @param array $data
     * @return int
     */
    public function create(array $data): int
    {
        // Call the parent constructor
        $id = parent::create($data);

        // Check if the id is valid
        if($id){

            // Retrieve the task
            $task = $this->fetch($id);

            // Check if the task's root has a task
            if(isset($task['root'],$task['root']['target'],$task['root']['target']['task']) && $task['root']['target']['task']){

                // Retrieve root the task
                $root = $this->fetch($task['root']['target']['task']);

                // Check if the task priority matches the root task priority
                if($task['priority'] != $root['priority']){
                    $this->update($id, ['priority' => $root['priority']]);
                }
            }
        }

        // Return the id
        return $id;
    }
}
