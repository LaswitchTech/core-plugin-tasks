<?php

// Import additionnal class into the global namespace
use \LaswitchTech\Core\Base\BaseEndpoint;

class TasksEndpoint extends BaseEndpoint {

    /**
     * Constructor
     */
    public function __construct()
    {
        // Call the parent constructor
        parent::__construct();

        // Initialize the Endpoint
        $this->init('tasks');

        // Set Properties
        $this->required = ['category','label','targetTable','targetId'];
    }

    /**
     * Retrieve multiple records
     */
    public function fetchAllAction(): array
    {
        // Call the parent constructor
        $message = parent::fetchAllAction();

        // Check if the records is accessible
        if($message['status'] == 200){

            // Check if the Categories is accessible
            if($this->Helper->Core->isInstalled('categories')){
                $message['data']['dependencies']['categories'] = $this->Model->Categories->fetchAll([
                    ["key" => "targetTable", "operator" => "=", "value" => $this->basename],
                ]);
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Retrieve a record
     */
    public function fetchAction(): array
    {
        // Call the parent constructor
        $message = parent::fetchAction();

        // Check if the records is accessible
        if($message['status'] == 200){

            // Check if the Relationship Plugin is accessible
            if($this->Helper->Core->isInstalled('relationship')){
                $message['data']['dependencies']['relationship'] = $this->Model->Relationship->get($this->basename, $message['data']['record']['id']);
                if($this->Helper->Core->isInstalled('vcards') && array_key_exists('vcard', $message['data']['record'])){
                    $message['data']['dependencies']['relationship'] = array_merge(
                        $message['data']['dependencies']['relationship'],
                        $this->Model->Relationship->get('vcards', $message['data']['record']['vcard']['id'])
                    );
                }
            }

            // Check if the Categories is accessible
            if($this->Helper->Core->isInstalled('categories')){
                $message['data']['dependencies']['categories'] = $this->Model->Categories->fetchAll([
                    ["key" => "targetTable", "operator" => "=", "value" => $this->basename],
                ]);
            }

            // Check if the Events is accessible
            if($this->Helper->Core->isInstalled('event')){
                $message['data']['dependencies']['event'] = $this->Model->Event->fetchAll([
                    ["key" => "targetTable", "operator" => "=", "value" => $this->basename],
                    ["key" => "targetId", "operator" => "=", "value" => $message['data']['record']['id']],
                    ["key" => "isArchived", "operator" => "<>", "value" => 1],
                ]);
            }

            // Check if the Notes is accessible
            if($this->Helper->Core->isInstalled('notes')){
                $message['data']['dependencies']['notes'] = $this->Model->Notes->fetchAll([
                    ["key" => "targetTable", "operator" => "=", "value" => $this->basename],
                    ["key" => "targetId", "operator" => "=", "value" => $message['data']['record']['id']],
                    ["key" => "isArchived", "operator" => "<>", "value" => 1],
                ]);
                $message['data']['dependencies']['notes'] = array_merge(
                    $message['data']['dependencies']['notes'] ?? [],
                    $this->Model->Notes->fetchAll([
                        ["key" => "targetTable", "operator" => "=", "value" => $message['data']['record']['targetTable']],
                        ["key" => "targetId", "operator" => "=", "value" => $message['data']['record']['targetId']],
                        ["key" => "isArchived", "operator" => "<>", "value" => 1],
                    ])
                );
                $message['data']['dependencies']['notes'] = array_merge(
                    $message['data']['dependencies']['notes'] ?? [],
                    $this->Model->Notes->fetchAll([
                        ["key" => "targetTable", "operator" => "=", "value" => $message['data']['record']['root']['targetTable']],
                        ["key" => "targetId", "operator" => "=", "value" => $message['data']['record']['root']['targetId']],
                        ["key" => "isArchived", "operator" => "<>", "value" => 1],
                    ])
                );
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Create a record
     */
    public function createAction(): array
    {
        // Call the parent constructor
        $message = parent::createAction();

        // Check if the record is accessible
        if($message['status'] == 200){

            // Retrieve the parameters
            $parameters = $message['data']['parameters'];

            // Initialize the fields array
            $fields = [];

            // Check if the Event Plugin is accessible
            if($this->Helper->Core->isInstalled('event')){

                // Initialize the Events
                $message['data']['event'] = [];

                // Setup a new event
                $event = [
                    'category' => 'Task',
                    'message' => 'New Task Created by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                    'icon' => 'circle',
                    'color' => 'secondary',
                    'link' => '/plugin/tasks/details?id='.$message['data']['record']['id'],
                    'targetTable' => 'tasks',
                    'targetId' => $message['data']['record']['id'],
                ];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);

                // Setup a new event for the target
                $event['link'] = '/plugin/'.$message['data']['record']['targetTable'].'/details?id='.$message['data']['record']['targetId'];
                $event['targetTable'] = $message['data']['record']['targetTable'];
                $event['targetId'] = $message['data']['record']['targetId'];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);

                // Setup a new event for the target
                $event['link'] = '/plugin/'.$message['data']['record']['root']['targetTable'].'/details?id='.$message['data']['record']['root']['targetId'];
                $event['targetTable'] = $message['data']['record']['root']['targetTable'];
                $event['targetId'] = $message['data']['record']['root']['targetId'];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);
            }

            // Check if $fields is empty
            if(!empty($fields)){
                $affectedRows = $this->Model->Tasks->update($message['data']['record']['id'], $fields);
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Update a record
     */
    public function updateAction(): array
    {
        // Call the parent constructor
        $message = parent::updateAction();

        // Check if the record is accessible
        if($message['status'] == 200){

            // Check if the Event Plugin is accessible
            if($this->Helper->Core->isInstalled('event')){

                // Initialize the Events
                $message['data']['event'] = [];

                // Setup a new event
                $event = [
                    'category' => 'Task',
                    'message' => 'Task Updated by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                    'icon' => 'circle',
                    'color' => 'secondary',
                    'link' => '/plugin/tasks/details?id='.$message['data']['record']['id'],
                    'targetTable' => 'tasks',
                    'targetId' => $message['data']['record']['id'],
                ];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);

                // Setup a new event for the target
                $event['link'] = '/plugin/'.$message['data']['record']['targetTable'].'/details?id='.$message['data']['record']['targetId'];
                $event['targetTable'] = $message['data']['record']['targetTable'];
                $event['targetId'] = $message['data']['record']['targetId'];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);

                // Setup a new event for the target
                $event['link'] = '/plugin/'.$message['data']['record']['root']['targetTable'].'/details?id='.$message['data']['record']['root']['targetId'];
                $event['targetTable'] = $message['data']['record']['root']['targetTable'];
                $event['targetId'] = $message['data']['record']['root']['targetId'];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Delete a record
     */
    public function deleteAction(): array
    {
        // Call the parent constructor
        $message = parent::deleteAction();

        // Check if the record is accessible
        if($message['status'] == 200){

            // Check if the Event Plugin is accessible
            if($this->Helper->Core->isInstalled('event')){

                // Initialize the Events
                $message['data']['event'] = [];

                // Setup a new event
                $event = [
                    'category' => 'Task',
                    'message' => 'Task Deleted by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                    'icon' => 'circle',
                    'color' => 'secondary',
                    'link' => '/plugin/tasks/details?id='.$message['data']['record']['id'],
                    'targetTable' => 'tasks',
                    'targetId' => $message['data']['record']['id'],
                ];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);

                // Setup a new event for the target
                $event['link'] = '/plugin/'.$message['data']['record']['targetTable'].'/details?id='.$message['data']['record']['targetId'];
                $event['targetTable'] = $message['data']['record']['targetTable'];
                $event['targetId'] = $message['data']['record']['targetId'];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);

                // Setup a new event for the target
                $event['link'] = '/plugin/'.$message['data']['record']['root']['targetTable'].'/details?id='.$message['data']['record']['root']['targetId'];
                $event['targetTable'] = $message['data']['record']['root']['targetTable'];
                $event['targetId'] = $message['data']['record']['root']['targetId'];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Archive a record
     */
    public function archiveAction(): array
    {
        // Retrieve the record
        $record = $this->Model->{$this->name}->fetch(intval($this->Request->getParams('REQUEST','id')));

        // Check if the record is already archived
        if($record['isArchived']){
            return ['status' => 200, 'message' => 'The '.$record.' is already archived.', 'data' => ['record' => $record]];
        }

        // Call the parent constructor
        $message = parent::archiveAction();

        // Check if the record is accessible
        if($message['status'] == 200){

            // Check if the Event Plugin is accessible
            if($this->Helper->Core->isInstalled('event')){

                // Initialize the Events
                $message['data']['event'] = [];

                // Setup a new event
                $event = [
                    'category' => 'Task',
                    'message' => 'Task Archived by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                    'icon' => 'circle',
                    'color' => 'secondary',
                    'link' => '/plugin/tasks/details?id='.$record['id'],
                    'targetTable' => 'tasks',
                    'targetId' => $record['id'],
                ];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);

                // Setup a new event for the target
                $event['link'] = '/plugin/'.$record['targetTable'].'/details?id='.$record['targetId'];
                $event['targetTable'] = $record['targetTable'];
                $event['targetId'] = $record['targetId'];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);

                // Setup a new event for the target
                $event['link'] = '/plugin/'.$record['root']['targetTable'].'/details?id='.$record['root']['targetId'];
                $event['targetTable'] = $record['root']['targetTable'];
                $event['targetId'] = $record['root']['targetId'];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Recover a record
     */
    public function recoverAction(): array
    {
        // Call the parent constructor
        $message = parent::recoverAction();

        // Check if the record is accessible
        if($message['status'] == 200){

            // Check if the Event Plugin is accessible
            if($this->Helper->Core->isInstalled('event')){

                // Initialize the Events
                $message['data']['event'] = [];

                // Setup a new event
                $event = [
                    'category' => 'Task',
                    'message' => 'Task Recovered by <vcard>'.$this->Auth->user()->vcard['id'].':'.$this->Auth->user()->username.'</vcard>',
                    'icon' => 'circle',
                    'color' => 'secondary',
                    'link' => '/plugin/tasks/details?id='.$message['data']['record']['id'],
                    'targetTable' => 'tasks',
                    'targetId' => $message['data']['record']['id'],
                ];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);

                // Setup a new event for the target
                $event['link'] = '/plugin/'.$message['data']['record']['targetTable'].'/details?id='.$message['data']['record']['targetId'];
                $event['targetTable'] = $message['data']['record']['targetTable'];
                $event['targetId'] = $message['data']['record']['targetId'];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);

                // Setup a new event for the target
                $event['link'] = '/plugin/'.$message['data']['record']['root']['targetTable'].'/details?id='.$message['data']['record']['root']['targetId'];
                $event['targetTable'] = $message['data']['record']['root']['targetTable'];
                $event['targetId'] = $message['data']['record']['root']['targetId'];

                // Create the event
                $message['data']['event'][] = $this->Model->Event->create($event);
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Upgrade tasks with a new process
     */
    public function upgradeAction(): array
    {

        // Set the default message
        $message = ["status" => 200, "message" => "OK", "data" => []];

        // Retrieve the tasks's category
        $id = $this->Request->getParams('REQUEST','id');

        // Check if the parameter exists
        if(empty($id) || is_null($id)){
            $message = ["status" => 400, "message" => "Bad Request", "data" => "The 'id' parameter is required."];
        }

        // Check if the task is accessible
        if($message['status'] == 200){

            // Check the request method
            if($this->Request->getMethod() == "GET"){

                // Retrieve the task process
                $process = $this->Model->Process->fetch($id);

                // Check if the process exists
                if(!empty($process)){

                    // Retrieve the incomplete tasks of the specified category
                    $tasks = $this->Model->Tasks->fetchAll([
                        ['key' => 'category','operator' => '=','value' => $process['category']],
                        ['key' => 'targetTable','operator' => '=','value' => $process['targetTable']],
                        ['key' => 'isCompleted','operator' => '<>','value' => 1],
                    ]);

                    // Check if the tasks exists
                    if(!empty($tasks)){

                        // Initialize the counters
                        $message['data']['tasks'] = count($tasks);
                        $message['data']['affectedRows'] = 0;

                        // Loop through the tasks
                        foreach($tasks as $task){

                            // Overwrite the task's process
                            $task['process'] = $process['process'];

                            // Update the progress
                            foreach($task['process'] as $stageId => $stage){

                                // Break if the stage ID is higher than the progress
                                if($stageId >= $task['progress']){
                                    break;
                                }

                                // Mark the tasks as completed
                                foreach($task['process'][$stageId]['tasks'] as $taskId => $step){

                                    // Mark the task as completed
                                    $task['process'][$stageId]['tasks'][$taskId]['isCompleted'] = true;
                                }

                                // Mark the stage as completed
                                $task['process'][$stageId]['isCompleted'] = true;
                            }

                            // Update the task in the database
                            $message['data']['affectedRows'] += $this->Model->Tasks->update($task['id'], ['process' => json_encode($task['process'])]);
                        }
                    }
                } else {
                    $message = ["status" => 404, "message" => "Not Found", "data" => "Could not find the requested process."];
                }
            } else {
                $message = ["status" => 405, "message" => "Method Not Allowed", "data" => "The method is not allowed for the requested URL."];
            }
        }

        // Return the message
        return $message;
    }
}
