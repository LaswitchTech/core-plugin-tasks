<article id="layout"></article>
<script>
    (function () {
        $(document).ready(function(){
            builder.Layout('index',"#layout",{
                endpoint: '/tasks/fetchAll',
                conditions: [
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
                order: [[7, 'asc']],
                columns: [
                    {
                        targets: 0,
                        visible: false,
                        title: builder.Locale.get('ID'),
                        name: 'id',
                        data: 'id',
                    },
                    {
                        targets: 1,
                        visible: false,
                        title: builder.Locale.get('Category'),
                        className: 'min-md',
                        name: 'category',
                        data: 'category',
                        defaultContent: '',
                        responsivePriority: 100,
                    },
                    {
                        targets: 2,
                        visible: true,
                        title: builder.Locale.get('Label'),
                        className: 'all',
                        name: 'label',
                        data: 'label',
                        width: '50%',
                        defaultContent: '',
                        responsivePriority: 1,
                        render: function(data, type, row, meta) {
                            return builder.Render('task.label', data, row, type);
                        },
                    },
                    {
                        targets: 3,
                        visible: false,
                        title: builder.Locale.get('Status'),
                        className: 'min-md',
                        name: 'status',
                        data: 'progress',
                        defaultContent: '',
                        responsivePriority: 200,
                        render: function(data, type, row, meta) {
                            return builder.Render('task.progress', data, row, type);
                        },
                    },
                    {
                        targets: 4,
                        visible: true,
                        title: builder.Locale.get('Task'),
                        className: 'min-md',
                        name: 'task',
                        data: 'process',
                        defaultContent: '',
                        responsivePriority: 10,
                        render: function(data, type, row, meta) {
                            return builder.Render('task.process', data, row, type);
                        },
                    },
                    {
                        targets: 5,
                        visible: true,
                        title: builder.Locale.get('Priority'),
                        className: 'min-md',
                        name: 'priority',
                        data: 'priority',
                        defaultContent: 0,
                        responsivePriority: 20,
                        render: function(data, type, row, meta) {
                            return builder.Render('task.priority', data, row, type);
                        },
                    },
                    {
                        targets: 6,
                        visible: true,
                        title: builder.Locale.get('Assigned To'),
                        className: 'min-md',
                        name: 'assignedTo',
                        data: 'assignedTo.username',
                        defaultContent: '',
                        responsivePriority: 30,
                        render: function(data, type, row, meta) {
                            return builder.Render('task.assignedTo.username', data, row, type);
                        },
                    },
                    {
                        targets: 7,
                        visible: true,
                        title: builder.Locale.get('Due'),
                        className: 'min-md',
                        name: 'due',
                        data: 'due',
                        defaultContent: '',
                        responsivePriority: 40,
                        render: function(data, type, row, meta) {
                            return builder.Render('task.due', data, row, type);
                        },
                    },
                ],
            });
        });
    })();
</script>
