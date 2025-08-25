<!-- ======= Task ======= -->
<?php if($this->Auth->isAuthenticated()): ?>
    <div class="nav-item">
        <div class="dropdown">
            <button class="nav-link text-decoration-none py-2 animate-pulse-hover" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                <i class="fs-4 bi bi-list-task" style="height: 2.25rem !important;width: 1.5rem !important"></i>
                <span id="tasksNotification" class="position-absolute top-25 start-75 translate-middle border border-light rounded-circle text-bg-teal d-none" style="padding:8px"></span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end pb-0" style="min-width:400px;max-width:500px">
                <li>
                    <h5 class="py-2 px-3 m-0 cursor-default d-flex justify-content-center align-items-center">
                        <span><?= $this->Locale->get('Tasks') ?></span>
                        <span id="tasksCount" class="badge rounded-pill ms-2 d-none text-bg-primary">0</span>
                    </h5>
                </li>
                <li><hr class="dropdown-divider m-0"></li>
                <div class="overflow-auto" style="max-height:500px" id="tasksList"></div>
                <li>
                    <a href="/plugin/tasks" class="dropdown-item text-center py-2 rounded-bottom btn btn-link">
                        <small><?= $this->Locale->get('View All') ?></small>
                    </a>
                </li>
            </ul>
        </div>
    </div>
    <script>
        $(document).ready(function(){

            // Retrieve the Tasks Elements
            const tasksNotification = $('#tasksNotification');
            const tasksCount = $('#tasksCount');
            const tasksList = $('#tasksList');

            // Create the Category Accordion
            const accordion = builder.Component(
                "accordion",
                tasksList,
                {
                    class: {
                        component: "w-100",
                    },
                    flush: true,
                    properties: {
                        class: {
                            collapse: "bg-transparent",
                        },
                    }
                },
                function(accordion,component){}
            );

            // Initialize Categories and Tasks
            var categories = {};
            var tasks = {};

            // Function to retrieve the Tasks
            function getTasks(){

                // Ajax Request
                $.ajax({
                    url: '/api/tasks/fetchAll',
                    headers: {'X-CSRF-Authorization': CSRF_KEY},
                    type: 'POST',dataType: 'json',
                    data: {
                        conditions: [
                            {key: 'assignedTo', operator: '=', value: USER_ID},
                            {key: 'isActive', operator: '=', value: 1},
                            {key: 'isArchived', operator: '<>', value: 1},
                            {key: 'isCompleted', operator: '=', value: 0},
                        ]
                    },
                    success: function(response) {

                        // Load the Categories
                        for(const [row, category] of Object.entries(response.dependencies.categories)){

                            // Check if the category has already been loaded
                            if(typeof categories[category.name] === 'undefined' && category.isShown){

                                // Initialize the category
                                categories[category.name] = {category: category};

                                // Add the category to the accordion
                                accordion.add(
                                    {
                                        icon: category.icon,
                                        title: builder.Locale.get(category.name.charAt(0).toUpperCase() + category.name.slice(1)),
                                    },
                                    function(item,accordion){

                                        // Item Styling
                                        item.content.addClass('p-0');
                                        item.collapse.addClass('show');
                                        item.header.button.removeClass('collapsed');

                                        // Save the accordion item
                                        categories[category.name].item = item;

                                        // Create the List
                                        categories[category.name].list = builder.Component(
                                            "list",
                                            item.content,
                                            {
                                                class: {
                                                    component: "bg-transparent",
                                                },
                                                icon: null,
                                            },
                                            function(list,component){},
                                        );
                                    },
                                );
                            }
                        }

                        // Load the Tasks
                        for(const [id, task] of Object.entries(response.records)){

                            // Check if the task has already been loaded
                            if(typeof categories[task.category] !== 'undefined'){
                                if(typeof tasks[task.id] === 'undefined'){

                                    // Show the notification
                                    tasksNotification.removeClass('d-none');

                                    // Update the count
                                    tasksCount.removeClass('d-none').text((parseInt(tasksCount.text()) + 1));

                                    // Initialize the task
                                    tasks[task.id] = {task: task};

                                    // Add the task to the list
                                    categories[task.category].list.add(
                                        {
                                            field: builder.Parser.parse(task.label),
                                        },
                                        function(item,list){

                                            // Styling
                                            item.addClass('position-relative cursor-pointer');
                                            item.field.addClass('px-2');

                                            // on hover Add bg-secondary to the item
                                            item.hover(
                                                function(){
                                                    item.addClass('text-bg-secondary');
                                                },
                                                function(){
                                                    item.removeClass('text-bg-secondary');
                                                },
                                            );

                                            // Add an absolute position container for the due date and priority
                                            item.container = $(document.createElement('div')).addClass('d-flex justify-content-end position-absolute top-0 end-0 me-2 mt-2').appendTo(item);

                                            // Add the priority to the item
                                            let color = ['secondary','primary','warning','orange','danger'];
                                            let name = ['Low','Normal','High','Urgent','Critical'];
                                            item.priority = $(document.createElement('span')).attr({
                                                "class": "badge rounded-end-0 text-bg-"+color[task.priority],
                                                "data-type": "priority",
                                                "data-task": task.id,
                                            }).text(name[task.priority]).appendTo(item.container);

                                            // Set date background
                                            var bg = 'text-bg-secondary';
                                            if(moment(task.due).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')){
                                                bg = 'text-bg-warning';
                                            }
                                            if(moment(task.due).isBefore(moment())){
                                                bg = 'text-bg-danger';
                                            }

                                            // Add the due date to the item
                                            item.due = $(document.createElement('span')).attr({
                                                "class": "badge rounded-start-0 "+bg,
                                                "data-type": "status",
                                                "data-task": task.id,
                                            }).addClass(bg).text(moment(task.due).format('YYYY-MM-DD HH:mm')).appendTo(item.container);

                                            // Remove the icon and actions divs
                                            setTimeout(() => {
                                                if(typeof item.actions !== 'undefined'){
                                                    item.actions.remove();
                                                }
                                                item.field.removeClass('px-1 py-2 ps-2 pe-0').addClass('p-2')
                                            }, 300);

                                            // Add the click event listener
                                            item.click(function(){
                                                // window.location.href = '/plugin/tasks?id=' + task.id;
                                                TaskModal(task.id);
                                            });
                                        },
                                    );
                                }
                            }
                        }
                    }
                });
            }

            // Retrieve the Tasks
            getTasks();

            // Set the interval to retrieve the tasks
            setInterval(function(){
                getTasks();
            }, 10000);
        });
    </script>
<?php endif; ?>
<!-- ======= End Task ======= -->
