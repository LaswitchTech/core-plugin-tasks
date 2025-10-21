<article id="layout"></article>
<script>
    (function () {
        $(document).ready(function(){
            builder.Layout('index',"#layout",{
                endpoint: '/tasks/fetchAll',
                conditions: [
                    {key: 'assignedTo', operator: '=', value: USER_ID},
                    {key: 'isActive', operator: '=', value: 1},
                    {key: 'isArchived', operator: '=', value: 0},
                    {key: 'isCompleted', operator: '=', value: 0},
                ],
                autoStart:true,
                dblclick: function(event, table, dt, node, data){
                    builder.Widget('task',{data: data.id}).view();
                },
                actions: {
                    details:{
                        label:'Details',
                        icon:'eye',
                        action:function(event, table, dt, node, row, data){
                            builder.Widget('task',{data: data.id}).view();
                        }
                    },
                    reschedule:{
                        label:'Re-Schedule',
                        icon:'calendar-week',
                        action:function(event, table, dt, node, row, data){
                            builder.Widget('task',{data: data.id}).schedule(function(response){
                                dt.row(row).data(response.record).draw();
                            });
                        }
                    },
                    archive:{
                        label:'Archive',
                        icon:'archive',
                        action:function(event, table, dt, node, row, data){
                            builder.Widget('task',{data: data.id}).archive(function(response){
                                table.delete(row);
                            });
                        }
                    },
                },
                buttons: [
                    {
                        extend : 'selected',
                        className : 'btn-warning requires-selection d-none',
                        init: function (dt, node){
                            $(node).removeClass('btn-secondary');
                        },
                        text: '<i class="bi bi-person-plus"></i><span class="ms-2 d-xxl-inline d-none">'+builder.Locale.get('Assign')+'</span>',
                        action:function(e, dt, node, config){
                            builder.Widget('tasks',{data: dt.rows({ selected: true }).data().toArray(),render:false}).assign(function(records){

                                // Refresh the records in the table
                                dt.rows({ selected: true }).data(records).draw();

                                // Deselect all rows
                                dt.rows().deselect();
                            });
                        },
                    },
                    {
                        extend : 'selected',
                        className : 'btn-warning requires-selection d-none',
                        init: function (dt, node){
                            $(node).removeClass('btn-secondary');
                        },
                        text: '<i class="bi bi-person-x"></i><span class="ms-2 d-xxl-inline d-none">'+builder.Locale.get('Unassign')+'</span>',
                        action:function(e, dt, node, config){
                            builder.Widget('tasks',{data: dt.rows({ selected: true }).data().toArray(),render:false}).unassign(function(records){

                                // Refresh the records in the table
                                dt.rows({ selected: true }).data(records).draw();

                                // Deselect all rows
                                dt.rows().deselect();
                            });
                        },
                    },
                    {
                        extend : 'selected',
                        className : 'btn-teal requires-selection d-none',
                        init: function (dt, node){
                            $(node).removeClass('btn-secondary');
                        },
                        text: '<i class="bi bi-calendar-week"></i><span class="ms-2 d-xxl-inline d-none">'+builder.Locale.get('Re-schedule')+'</span>',
                        action:function(e, dt, node, config){
                            builder.Widget('tasks',{data: dt.rows({ selected: true }).data().toArray(),render:false}).schedule(function(records){

                                // Refresh the records in the table
                                dt.rows({ selected: true }).data(records).draw();

                                // Deselect all rows
                                dt.rows().deselect();
                            });
                        },
                    },
                    {
                        extend : 'selected',
                        className : 'btn-primary requires-selection d-none',
                        init: function (dt, node){
                            $(node).removeClass('btn-secondary');
                        },
                        text: '<i class="bi bi-exclamation-triangle"></i><span class="ms-2 d-xxl-inline d-none">'+builder.Locale.get('Priority')+'</span>',
                        action:function(e, dt, node, config){
                            builder.Widget('tasks',{data: dt.rows({ selected: true }).data().toArray(),render:false}).priority(function(records){

                                // Refresh the records in the table
                                dt.rows({ selected: true }).data(records).draw();

                                // Deselect all rows
                                dt.rows().deselect();
                            });
                        },
                    },
                    {
                        extend : 'selected',
                        className : 'btn-dark requires-selection d-none',
                        init: function (dt, node){
                            $(node).removeClass('btn-secondary');
                        },
                        text: '<i class="bi bi-archive"></i><span class="ms-2 d-xxl-inline d-none">'+builder.Locale.get('Archive')+'</span>',
                        action:function(e, dt, node, config){
                            builder.Widget('tasks',{data: dt.rows({ selected: true }).data().toArray(),render:false}).archive(function(records){

                                // Remove the records from the table
                                dt.rows({ selected: true }).remove().draw();

                                // Deselect all rows
                                dt.rows().deselect();
                            });
                        },
                    },
                ],
                order: [[15, 'asc']],
                columns: tasksDefinition,
            });
        });
    })();
</script>
