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
     * Retrieve multiple records
     *
     * @param array $conditions
     * @return array
     */
    public function fetchAll(array $conditions = [], string $conjunction = 'AND'): array
    {
        // Create the Query
        $Query = $this->Database->query()
            ->table($this->table)
            ->select('*')
            ->join('owner', 'users', 'username')
            ->join('assignedTo', 'users', 'id')
            ->join('organization', 'organizations', 'id')
            ->order('due', 'ASC')
            ->filter()
            ->where('id', 9999, '<>')
            ->where('organization', $this->Auth->user()->organization()->id);

        // Check if the conditions are empty
        if(!empty($conditions)){

            // Add a Filter
            $Query->filter();

            // Add the Conditions
            foreach($conditions as $key => $condition){

                // Check if the key exists in the definition
                if(!array_key_exists($condition['key'], $this->definition)){

                    // Remove the key from the data
                    unset($conditions[$key]);
                    continue;
                }

                // Add the condition to the Query
                $Query->where($condition["key"], $condition["value"], $condition["operator"], $conjunction);
            }
        }

        // Retrieve the Results
        $records = $Query->fetch();

        // Loop through the records to process them
        foreach($records as $key => $record){

            // Overwrite the record with the processed one
            $records[$key] = $this->process($record);
        }

        // Return the Results
        return $records;
    }

    /**
     * Retrieve a single record
     *
     * @param int $id
     * @return array
     */
    public function fetch(int $id): array
    {
        // Create the Query
        $Query = $this->Database->query()
            ->table($this->table)
            ->select('*')
            ->join('owner', 'users', 'username')
            ->join('assignedTo', 'users', 'id')
            ->join('organization', 'organizations', 'id')
            ->filter()
            ->where('id', 9999, '<>')
            ->where('organization', $this->Auth->user()->organization()->id)
            ->filter()
            ->where($this->primary, $id)
            ->limit(1);

        // Retrieve the record
        $records = $Query->fetch();

        // Loop through the records to process them
        foreach($records as $key => $record){

            // Overwrite the record with the processed one
            $records[$key] = $this->process($record);
        }

        // Return the record or an empty array if not found
        return $records[array_key_first($records)] ?? [];
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
}
