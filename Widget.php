<!-- ======= Task ======= -->
<?php if($this->Auth->isAuthenticated()): ?>
    <div class="nav-item" id="widgetTasks"></div>
    <script>
        (function () {
            $(document).ready(function(){
                builder.Widget('widgetTasks', '#widgetTasks');
            });
        })();
    </script>
<?php endif; ?>
<!-- ======= End Task ======= -->
