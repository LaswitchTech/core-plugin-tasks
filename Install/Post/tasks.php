<?php

require_once realpath(__DIR__ . '/../../Model.php');

class TasksPostModel extends TasksModel {

    /**
     * Post process a record
     *
     * @param array $record
     * @return array
     */
    public function post($record): array
    {
        // Loop through the record
        foreach($record as $key => $value){

            // Handle specific fields
            switch($key){
                case 'id':
                    break;
                case 'link':
                    // Only process if not empty
                    if(!empty($value) && !is_null($value)){
                        // Replace /plugin/leads/details with /crm/details
                        if(str_starts_with($value, '/plugin/leads/details')){
                            $record[$key] = str_replace('/plugin/leads/details', '/crm/details', $value);
                        }
                        // Replace /plugin/clients/details with /clients/details
                        if(str_starts_with($value, '/plugin/clients/details')){
                            $record[$key] = str_replace('/plugin/clients/details', '/clients/details', $value);
                        }
                    }
                    break;
                default:
                    unset($record[$key]);
                    break;
            }
        }

        // Return the record
        return $record;
    }
}
