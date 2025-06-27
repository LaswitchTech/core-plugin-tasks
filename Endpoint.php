<?php

/**
 * Core Framework - TasksEndpoint
 *
 * @license    MIT (https://mit-license.org/)
 * @author     Louis Ouellet <louis@laswitchtech.com>
 */

// Import additionnal class into the global namespace
use \LaswitchTech\Core\Abstracts\Endpoint;

class TasksEndpoint extends Endpoint {

    /**
     * Constructor
     */
    public function __construct()
    {

        // Call Parent Constructor
        parent::__construct();

        // Retrieve the namespace
        $namespace = $this->Request->getNamespace();

        // Set Global access
        $this->Public = false;

        // Set Level
        switch($namespace){
            case "/tasks/index":
            case "/tasks/details":
            case "/tasks/count":
                $this->Level = 1;
                break;
            case "/tasks/due":
            case "/tasks/priority":
            case "/tasks/unassign":
            case "/tasks/assign":
            case "/tasks/process":
            case "/tasks/activate":
            case "/tasks/deactivate":
            case "/tasks/upgrade":
                $this->Level = 3;
                break;
            default:
                $this->Level = 4;
                break;
        }
    }

    /**
     * Retrieve Tasks
     */
    public function indexAction(): array
    {
        // Import Global Variables
        global $CSRF;

        // Set the default message
        $message = ["status" => 200, "message" => "OK", "data" => []];

        // Check the request method
        if($this->Request->getMethod() == "POST"){
            $message["data"]["CSRF"] = [
                "token" => $CSRF->token(),
                "key" => $CSRF->key()
            ];
        }

        // Retrieve the conditions
        $conditions = $this->Request->getParams('REQUEST','conditions') ?? [];

        // Check if the task is accessible
        if($message['status'] == 200){

            // Check the request method
            if($this->Request->getMethod() == "POST"){

                // Retrieve the tasks
                $message['data']['records'] = $this->Model->Tasks->fetchAll($conditions);

                // Retrieve the categories
                $message['data']['categories'] = $this->Model->Category->get('tasks');
            } else {
                $message = ["status" => 405, "message" => "Method Not Allowed", "data" => "The method is not allowed for the requested URL."];
            }
        }
        return $message;
    }

    /**
     * Retrieve Task's Details
     */
    public function detailsAction(): array
    {
        $message = ["status" => 200, "message" => "OK", "data" => []];
        $task = $this->Model->Tasks->fetch(intval($this->Request->getParams('GET','id')));
        if(empty($task)){
            $message = ["status" => 404, "message" => "Not Found", "data" => "Could not find the requested task."];
        } else {
            if($task['assignedTo']['id'] != $this->Auth->user()->id){
                $roles = $this->Auth->user()->roles();
                if(!in_array('Administrator',$roles) && !in_array('Marketing Manager',$roles)){
                    $message = ["status" => 403, "message" => "Forbidden", "data" => "You are not allowed to access this task."];
                }
            }
        }
        if($message['status'] == 200){
            $relationships = $this->Model->Relationship->get('tasks', $task['id']);
            $message['data'] = [
                "record" => $task,
            ];

            // // Check if the Inventory is accessible
            // if(!is_null($this->Model->Inventory)){
            //     if(!is_null($lead['client']['id']))
            //     $message['data']['dependencies']['inventory'] = $this->Model->Inventory->fetchAll([
            //         ["key" => "targetTable", "operator" => "=", "value" => "clients"],
            //         ["key" => "targetId", "operator" => "=", "value" => $lead['client']['id']],
            //     ]);
            // }
        }
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
        $category = $this->Request->getParams('REQUEST','category');

        // Check if the parameter exists
        if(empty($category) || is_null($category)){
            $message = ["status" => 400, "message" => "Bad Request", "data" => "The 'category' parameter is required."];
        }

        // Check if the task is accessible
        if($message['status'] == 200){

            // Check the request method
            if($this->Request->getMethod() == "GET"){

                // Retrieve the lead process
                $process = $this->Model->Process->get($category);

                // Check if the process exists
                if(!empty($process)){

                    // Retrieve the incomplete tasks of the specified category
                    $tasks = $this->Model->Tasks->fetchAll([
                        ['key' => 'category','operator' => '=','value' => $category],
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

    /**
     * Retrieve a Count of Tasks
     */
    public function countAction(): array
    {
        // Import Global Variables
        global $CSRF;

        // Set the default message
        $message = ["status" => 200, "message" => "OK", "data" => []];

        // Check the request method
        if($this->Request->getMethod() == "POST"){
            $message["data"]["CSRF"] = [
                "token" => $CSRF->token(),
                "key" => $CSRF->key()
            ];
        }

        // Retrieve the conditions
        $conditions = $this->Request->getParams('REQUEST','conditions') ?? [];

        // Check if the task is accessible
        if($message['status'] == 200){

            // Check the request method
            if($this->Request->getMethod() == "POST"){

                // Retrieve the task's count
                $message['data'] = $this->Model->Tasks->count($conditions);
            } else {
                $message = ["status" => 405, "message" => "Method Not Allowed", "data" => "The method is not allowed for the requested URL."];
            }
        }
        return $message;
    }

    /**
     * Retrieve or set the due date of a task
     */
    public function dueAction(): array
    {
        // Import Global Variables
        global $CSRF;

        // Set the default message
        $message = ["status" => 200, "message" => "OK", "data" => []];

        // Check the request method
        if($this->Request->getMethod() == "POST"){
            $message["data"]["CSRF"] = [
                "token" => $CSRF->token(),
                "key" => $CSRF->key()
            ];
        }

        // Retrieve the task id
        $id = intval($this->Request->getParams('REQUEST','id'));

        // Retrieve the task
        $task = $this->Model->Tasks->fetch($id);

        // Check if the task exists
        if(empty($task)){
            $message = ["status" => 404, "message" => "Not Found", "data" => "Could not find the requested task."];
        } else {

            // Check if the user is allowed to access the task
            if($task['assignedTo']['id'] != $this->Auth->user()->id){

                // Retrieve the user's roles
                $roles = $this->Auth->user()->roles();

                // Check if the user is an Administrator or a Marketing Manager
                if(!in_array('Administrator',$roles) && !in_array('Marketing Manager',$roles)){
                    $message = ["status" => 403, "message" => "Forbidden", "data" => "You are not allowed to access this task."];
                }
            }
        }

        // Check if the task is accessible
        if($message['status'] == 200){

            // Check the request method
            if($this->Request->getMethod() == "POST"){

                // Initialize the Events
                $message['data']['events'] = [];

                // Retrieve the due date
                $due = $this->Request->getParams('REQUEST','due');

                // Set the new due date
                $affectedRows = $this->Model->Tasks->update($id, ['due' => $due]);

                // Check if the task has been updated
                if($affectedRows){

                    // Retrieve the user's username and vCard
                    $owner = $this->Auth->user()->username;
                    $vCard = $this->Auth->user()->vcard();

                    // Create the related events
                    $message['data']['events'][] = $this->Model->Event->create($owner, 'tasks', $task['id'], 'Task', '<vcard>'.$vCard['id'].':'.$this->Auth->user()->username.'</vcard> updated the due date to <date>'.$due.'</date>', '/plugin/tasks/index?id='.$task['id']);

                    // Check if a target object has been assigned on the task
                    if($affectedRows > 1){

                        // Create the related events
                        $message['data']['events'][] = $this->Model->Event->create($owner, $task['targetTable'], $task['targetId'], 'Object', '<vcard>'.$vCard['id'].':'.$this->Auth->user()->username.'</vcard> updated the due date to <date>'.$due.'</date>', $task['link']);
                    }
                }

                // Set the affected rows
                $message['data']["affectedRows"] = $affectedRows;
            } elseif ($this->Request->getMethod() == "GET"){

                // Retrieve the task's due date
                $message['data'] = $task['due'];
            } else {
                $message = ["status" => 405, "message" => "Method Not Allowed", "data" => "The method is not allowed for the requested URL."];
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Retrieve or set the priority of a task
     */
    public function priorityAction(): array
    {
        // Import Global Variables
        global $CSRF;

        // Set the default message
        $message = ["status" => 200, "message" => "OK", "data" => []];

        // Check the request method
        if($this->Request->getMethod() == "POST"){
            $message["data"]["CSRF"] = [
                "token" => $CSRF->token(),
                "key" => $CSRF->key()
            ];
        }

        // Retrieve the task id
        $id = intval($this->Request->getParams('REQUEST','id'));

        // Retrieve the task
        $task = $this->Model->Tasks->fetch($id);

        // Check if the task exists
        if(empty($task)){
            $message = ["status" => 404, "message" => "Not Found", "data" => "Could not find the requested task."];
        } else {

            // Check if the user is allowed to access the task
            if($task['assignedTo']['id'] != $this->Auth->user()->id){

                // Retrieve the user's roles
                $roles = $this->Auth->user()->roles();

                // Check if the user is an Administrator or a Marketing Manager
                if(!in_array('Administrator',$roles) && !in_array('Marketing Manager',$roles)){
                    $message = ["status" => 403, "message" => "Forbidden", "data" => "You are not allowed to access this task."];
                }
            }
        }

        // Check if the task is accessible
        if($message['status'] == 200){

            // Check the request method
            if($this->Request->getMethod() == "POST"){

                // Initialize the Events
                $message['data']['events'] = [];

                // Retrieve the priority
                $priority = intval($this->Request->getParams('REQUEST','priority'));

                // Set the new priority
                $affectedRows = $this->Model->Tasks->update($id, ['priority' => $priority]);

                // Check if the task has been updated
                if($affectedRows){

                    // Retrieve the user's username and vCard
                    $owner = $this->Auth->user()->username;
                    $vCard = $this->Auth->user()->vcard();

                    // Create the related events
                    $message['data']['events'][] = $this->Model->Event->create($owner, 'tasks', $task['id'], 'Task', '<vcard>'.$vCard['id'].':'.$this->Auth->user()->username.'</vcard> updated the priority to <priority>'.$priority.'</priority>', '/plugin/tasks/index?id='.$task['id']);

                    // Check if a target object has been assigned on the task
                    if($affectedRows > 1){

                        // Create the related events
                        $message['data']['events'][] = $this->Model->Event->create($owner, $task['targetTable'], $task['targetId'], 'Object', '<vcard>'.$vCard['id'].':'.$this->Auth->user()->username.'</vcard> updated the priority to <priority>'.$priority.'</priority>', $task['link']);
                    }
                }

                // Set the affected rows
                $message['data']["affectedRows"] = $affectedRows;
            } elseif ($this->Request->getMethod() == "GET"){

                // Retrieve the task's priority
                $message['data'] = $task['priority'];
            } else {
                $message = ["status" => 405, "message" => "Method Not Allowed", "data" => "The method is not allowed for the requested URL."];
            }
        }

        // Return the message
        return $message;
    }

    /**
     * unassign a task
     */
    public function unassignAction(): array
    {
        // Set the default message
        $message = ["status" => 200, "message" => "OK", "data" => []];

        // Retrieve the task id
        $id = intval($this->Request->getParams('REQUEST','id'));

        // Retrieve the task
        $task = $this->Model->Tasks->fetch($id);

        // Check if the task exists
        if(empty($task)){
            $message = ["status" => 404, "message" => "Not Found", "data" => "Could not find the requested task."];
        } else {

            // Check if the user is allowed to access the task
            if($task['assignedTo']['id'] != $this->Auth->user()->id){

                // Retrieve the user's roles
                $roles = $this->Auth->user()->roles();

                // Check if the user is an Administrator or a Marketing Manager
                if(!in_array('Administrator',$roles) && !in_array('Marketing Manager',$roles)){
                    $message = ["status" => 403, "message" => "Forbidden", "data" => "You are not allowed to access this task."];
                }
            }
        }

        // Retrieve the original vcard
        $task['assignedTo']['vcard'] = $this->Model->Vcards->get($task['assignedTo']['vcard']);

        // Check if the task is accessible
        if($message['status'] == 200){

            // Check the request method
            if($this->Request->getMethod() == "GET"){

                // Initialize the Events
                $message['data']['events'] = [];

                // Update the task
                $affectedRows = $this->Model->Tasks->update($id, ['assignedTo' => null]);

                // Update the target
                if(isset($task['target']['assignedTo'])){

                    // Import Global Variables
                    global $DATABASE;

                    // Create the Query
                    $Query = $DATABASE->query()
                        ->table($task['targetTable'])
                        ->update(['assignedTo' => null])
                        ->where('id', $task['targetId']);

                    // Execute the Query
                    $affectedRows = ($affectedRows + $Query->execute());
                }

                // Check if the task has been updated
                if($affectedRows){

                    // Retrieve the user's username and vCard
                    $owner = $this->Auth->user()->username;
                    $vCard = $this->Auth->user()->vcard();

                    // Create the related events
                    $message['data']['events'][] = $this->Model->Event->create($owner, 'tasks', $task['id'], 'Task', '<vcard>'.$vCard['id'].':'.$this->Auth->user()->username.'</vcard> has unassigned <vcard>'.$task['assignedTo']['vcard']['id'].':'.$task['assignedTo']['username'].'</vcard> from this task.', '/plugin/tasks/index?id='.$task['id']);

                    // Check if a target object has been assigned on the task
                    if($affectedRows > 1){

                        // Create the related events
                        $message['data']['events'][] = $this->Model->Event->create($owner, $task['targetTable'], $task['targetId'], 'Object', '<vcard>'.$vCard['id'].':'.$this->Auth->user()->username.'</vcard> has unassigned <vcard>'.$task['assignedTo']['vcard']['id'].':'.$task['assignedTo']['username'].'</vcard> from this object.', $task['link']);
                    }
                }

                // Set the affected rows
                $message['data']["affectedRows"] = $affectedRows;
                $message['data']["record"] = $this->Model->Tasks->fetch($id);
            } else {
                $message = ["status" => 405, "message" => "Method Not Allowed", "data" => "The method is not allowed for the requested URL."];
            }
        }

        // Return the message
        return $message;
    }

    /**
     * assign a task
     */
    public function assignAction(): array
    {
        // Import Global Variables
        global $CSRF;

        // Set the default message
        $message = ["status" => 200, "message" => "OK", "data" => []];

        // Check the request method
        if($this->Request->getMethod() == "POST"){
            $message["data"]["CSRF"] = [
                "token" => $CSRF->token(),
                "key" => $CSRF->key()
            ];
        }

        // Retrieve the task id
        $id = intval($this->Request->getParams('REQUEST','id'));

        // Retrieve the task
        $task = $this->Model->Tasks->fetch($id);

        // Check if the task exists
        if(empty($task)){
            $message = ["status" => 404, "message" => "Not Found", "data" => "Could not find the requested task."];
        } else {

            // Check if the user is allowed to access the task
            if($task['assignedTo']['id'] != $this->Auth->user()->id){

                // Retrieve the user's roles
                $roles = $this->Auth->user()->roles();

                // Check if the user is an Administrator or a Marketing Manager
                if(!in_array('Administrator',$roles) && !in_array('Marketing Manager',$roles)){
                    $message = ["status" => 403, "message" => "Forbidden", "data" => "You are not allowed to access this task."];
                }
            }
        }

        // Check if the task is accessible
        if($message['status'] == 200){

            // Check the request method
            if($this->Request->getMethod() == "POST"){

                // Retrieve the assignedTo
                $assignedTo = intval($this->Request->getParams('REQUEST','assignedTo'));

                // Retrieve the user
                $user = $this->Auth->user($assignedTo)->vcard();

                // Check if the user exists
                if(!is_null($user['id'])){

                    // Initialize the Events
                    $message['data']['events'] = [];

                    // Update the task
                    $affectedRows = $this->Model->Tasks->update($id, ['assignedTo' => $assignedTo]);

                    // Update the target
                    if(array_key_exists('assignedTo', $task['target']) && $task['target']['assignedTo'] != $assignedTo){

                        // Import Global Variables
                        global $DATABASE;

                        // Create the Query
                        $Query = $DATABASE->query()
                            ->table($task['targetTable'])
                            ->update(['assignedTo' => $assignedTo])
                            ->where('id', $task['targetId']);

                        // Execute the Query
                        $affectedRows = ($affectedRows + $Query->execute());
                    }

                    // Check if the task has been updated
                    if($affectedRows){

                        // Retrieve the user's username and vCard
                        $owner = $this->Auth->user()->username;
                        $vCard = $this->Auth->user()->vcard();

                        // Create the related events
                        $message['data']['events'][] = $this->Model->Event->create($owner, 'tasks', $task['id'], 'Task', '<vcard>'.$vCard['id'].':'.$this->Auth->user()->username.'</vcard> has assigned <vcard>'.$user['id'].':'.$user['email'].'</vcard> on this task.', '/plugin/tasks/index?id='.$task['id']);

                        // Check if a target object has been assigned on the task
                        if($affectedRows > 1){

                            // Create the related events
                            $message['data']['events'][] = $this->Model->Event->create($owner, $task['targetTable'], $task['targetId'], 'Object', '<vcard>'.$vCard['id'].':'.$this->Auth->user()->username.'</vcard> has assigned <vcard>'.$user['id'].':'.$user['email'].'</vcard> on this object.', $task['link']);
                        }
                    }

                    // Set the affected rows
                    $message['data']["affectedRows"] = $affectedRows;
                    $message['data']["record"] = $this->Model->Tasks->fetch($id);
                } else {
                    $message = ["status" => 404, "message" => "Not Found", "data" => "Could not find the requested user."];
                }
            } else {
                $message = ["status" => 405, "message" => "Method Not Allowed", "data" => "The method is not allowed for the requested URL."];
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Retrieve or set the process of a task
     */
    public function processAction(): array
    {
        // Import Global Variables
        global $CSRF;

        // Set the default message
        $message = ["status" => 200, "message" => "OK", "data" => []];

        // Check the request method
        if($this->Request->getMethod() == "POST"){
            $message["data"]["CSRF"] = [
                "token" => $CSRF->token(),
                "key" => $CSRF->key()
            ];
        }

        // Retrieve the task id
        $id = intval($this->Request->getParams('REQUEST','id'));

        // Retrieve the task
        $task = $this->Model->Tasks->fetch($id);

        // Check if the task exists
        if(empty($task)){
            $message = ["status" => 404, "message" => "Not Found", "data" => "Could not find the requested task."];
        } else {

            // Check if the user is allowed to access the task
            if($task['assignedTo']['id'] != $this->Auth->user()->id){

                // Retrieve the user's roles
                $roles = $this->Auth->user()->roles();

                // Check if the user is an Administrator or a Marketing Manager
                if(!in_array('Administrator',$roles) && !in_array('Marketing Manager',$roles)){
                    $message = ["status" => 403, "message" => "Forbidden", "data" => "You are not allowed to access this task."];
                }
            }
        }

        // Check if the task is accessible
        if($message['status'] == 200){

            // Check the request method
            if($this->Request->getMethod() == "POST"){

                // Initialize the Events
                $message['data']['events'] = [];

                // Retrieve the process
                $process = $this->Request->getParams('REQUEST','process');

                // Initialize the progress
                $progress = 0;

                // Initialize Completed
                $wasCompleted = intval($task['isCompleted']);
                $isCompleted = intval($task['isCompleted']);

                // Loop through the process
                foreach($process as $stageId => $stage){

                    // Convert string to boolean
                    $process[$stageId]['isCompleted'] = filter_var($stage['isCompleted'], FILTER_VALIDATE_BOOLEAN);
                    $process[$stageId]['onComplete'] = empty($stage['onComplete']) ? null : $stage['onComplete'];

                    // Loop through the process
                    foreach($stage['tasks'] as $taskId => $step){

                        // Convert string to boolean
                        $process[$stageId]['tasks'][$taskId]['isCompleted'] = filter_var($step['isCompleted'], FILTER_VALIDATE_BOOLEAN);
                        $process[$stageId]['tasks'][$taskId]['isDisabled'] = filter_var($step['isDisabled'], FILTER_VALIDATE_BOOLEAN);
                        $process[$stageId]['tasks'][$taskId]['onComplete'] = empty($step['onComplete']) ? null : $step['onComplete'];

                        // Check if the last task of the last stage is completed
                        if((intval($stageId) == count($process)) && (intval($taskId) == count($stage['tasks']))){
                            $isCompleted = intval($process[$stageId]['tasks'][$taskId]['isCompleted']);
                        }
                    }

                    // Update the progress
                    if($process[$stageId]['isCompleted']){
                        if($progress == intval($stageId) || intval($stageId) == 1){
                            $progress = intval($stageId) + 1;
                        }
                    }
                }

                // Set the updates
                $updates = ['progress' => $progress, 'process' => $process];

                // Check if the task was completed
                if($isCompleted && ($wasCompleted != $isCompleted)){

                    // Set the updates
                    $updates['isCompleted'] = intval($isCompleted);
                    $updates['completedOn'] = date('Y-m-d H:i:s');
                }

                // Check if the progress is higher than it should be
                if($progress > count($process)){
                    $progress = count($process);
                    $updates['progress'] = $progress;
                    $updates['isActive'] = 0;
                }

                // Set the new process
                $affectedRows = $this->Model->Tasks->update($id, $updates);

                // Check if the task has been updated
                if($affectedRows){

                    // Retrieve the user's username and vCard
                    $owner = $this->Auth->user()->username;
                    $vCard = $this->Auth->user()->vcard();

                    // Create the related events
                    $message['data']['events'][] = $this->Model->Event->create($owner, 'tasks', $task['id'], 'Task', '<vcard>'.$vCard['id'].':'.$this->Auth->user()->username.'</vcard> updated the process', '/plugin/tasks/index?id='.$task['id']);

                    // Check if a target object has been assigned on the task
                    if($affectedRows > 1){

                        // Create the related events
                        $message['data']['events'][] = $this->Model->Event->create($owner, $task['targetTable'], $task['targetId'], 'Object', '<vcard>'.$vCard['id'].':'.$this->Auth->user()->username.'</vcard> updated the process', $task['link']);
                    }
                }

                // Set the affected rows
                $message['data']["affectedRows"] = $affectedRows;
            } elseif ($this->Request->getMethod() == "GET"){

                // Retrieve the task's process
                $message['data'] = $task['process'];
            } else {
                $message = ["status" => 405, "message" => "Method Not Allowed", "data" => "The method is not allowed for the requested URL."];
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Activate a task
     */
    public function activateAction(): array
    {
        // Import Global Variables
        global $CSRF;

        // Set the default message
        $message = ["status" => 200, "message" => "OK", "data" => []];

        // Retrieve the task id
        $id = intval($this->Request->getParams('REQUEST','id'));

        // Retrieve the task
        $task = $this->Model->Tasks->fetch($id);

        // Check if the task exists
        if(empty($task)){
            $message = ["status" => 404, "message" => "Not Found", "data" => "Could not find the requested task."];
        } else {

            // Check if the user is allowed to access the task
            if($task['assignedTo']['id'] != $this->Auth->user()->id){

                // Retrieve the user's roles
                $roles = $this->Auth->user()->roles();

                // Check if the user is an Administrator or a Marketing Manager
                if(!in_array('Administrator',$roles) && !in_array('Marketing Manager',$roles)){
                    $message = ["status" => 403, "message" => "Forbidden", "data" => "You are not allowed to access this task."];
                }
            }
        }

        // Check if the task is accessible
        if($message['status'] == 200){

            // Check the request method
            if($this->Request->getMethod() == "GET"){

                // Initialize the Events
                $message['data']['events'] = [];

                // Set the new process
                $affectedRows = $this->Model->Tasks->update($id, ['isActive' => 1]);

                // Check if the task has been updated
                if($affectedRows){

                    // Retrieve the user's username and vCard
                    $owner = $this->Auth->user()->username;
                    $vCard = $this->Auth->user()->vcard();

                    // Create the related events
                    $message['data']['events'][] = $this->Model->Event->create($owner, 'tasks', $task['id'], 'Task', '<vcard>'.$vCard['id'].':'.$this->Auth->user()->username.'</vcard> activated the task', '/plugin/tasks/index?id='.$task['id']);
                    $message['data']['events'][] = $this->Model->Event->create($owner, $task['targetTable'], $task['targetId'], 'Object', '<vcard>'.$vCard['id'].':'.$this->Auth->user()->username.'</vcard> activated the task', $task['link']);
                }

                // Set the affected rows
                $message['data']["affectedRows"] = $affectedRows;
            } else {
                $message = ["status" => 405, "message" => "Method Not Allowed", "data" => "The method is not allowed for the requested URL."];
            }
        }

        // Return the message
        return $message;
    }

    /**
     * Deactivate a task
     */
    public function deactivateAction(): array
    {
        // Import Global Variables
        global $CSRF;

        // Set the default message
        $message = ["status" => 200, "message" => "OK", "data" => []];

        // Retrieve the task id
        $id = intval($this->Request->getParams('REQUEST','id'));

        // Retrieve the task
        $task = $this->Model->Tasks->fetch($id);

        // Check if the task exists
        if(empty($task)){
            $message = ["status" => 404, "message" => "Not Found", "data" => "Could not find the requested task."];
        } else {

            // Check if the user is allowed to access the task
            if($task['assignedTo']['id'] != $this->Auth->user()->id){

                // Retrieve the user's roles
                $roles = $this->Auth->user()->roles();

                // Check if the user is an Administrator or a Marketing Manager
                if(!in_array('Administrator',$roles) && !in_array('Marketing Manager',$roles)){
                    $message = ["status" => 403, "message" => "Forbidden", "data" => "You are not allowed to access this task."];
                }
            }
        }

        // Check if the task is accessible
        if($message['status'] == 200){

            // Check the request method
            if($this->Request->getMethod() == "GET"){

                // Initialize the Events
                $message['data']['events'] = [];

                // Set the new process
                $affectedRows = $this->Model->Tasks->update($id, ['isActive' => 0]);

                // Check if the task has been updated
                if($affectedRows){

                    // Retrieve the user's username and vCard
                    $owner = $this->Auth->user()->username;
                    $vCard = $this->Auth->user()->vcard();

                    // Create the related events
                    $message['data']['events'][] = $this->Model->Event->create($owner, 'tasks', $task['id'], 'Task', '<vcard>'.$vCard['id'].':'.$this->Auth->user()->username.'</vcard> deactivated the task', '/plugin/tasks/index?id='.$task['id']);
                    $message['data']['events'][] = $this->Model->Event->create($owner, $task['targetTable'], $task['targetId'], 'Object', '<vcard>'.$vCard['id'].':'.$this->Auth->user()->username.'</vcard> deactivated the task', $task['link']);
                }

                // Set the affected rows
                $message['data']["affectedRows"] = $affectedRows;
            } else {
                $message = ["status" => 405, "message" => "Method Not Allowed", "data" => "The method is not allowed for the requested URL."];
            }
        }

        // Return the message
        return $message;
    }
}
