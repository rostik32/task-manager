const path = location.pathname;


if (path.includes('newTask')) {
    const newTaskForm = document.querySelector('.new-task__form');
    newTaskForm.addEventListener('submit', addNewTask);

} else if (path.includes('editTask')) {
    editTask();

} else {
    renderCard();

    const sortBtn = document.querySelector('.task-manager__sort');
    sortBtn.addEventListener('change', sortTasks);
}


function renderCard() {
    const cardsList = document.querySelector('.task-manager__cards');
    const tasks = getLocalStorage('tasks');
    
    checkEmptyList(tasks, cardsList);

    tasks.forEach(({ id, title, description, timestamp }) => {
        const date = new Date(+timestamp);
        const year = date.getFullYear();
        const month = addZero(date.getMonth() + 1);
        const day = addZero(date.getDate());
        const hours = addZero(date.getHours());
        const minutes = addZero(date.getMinutes());

        cardsList.insertAdjacentHTML('beforeend', `
            <li class="task-card col-lg-4 col-md-6  w-100 mb-4 pr-3" data-idd="${id}" data-timestamp="${timestamp}">
                <div class="task-manager__card d-flex flex-column bg-white p-2 shadow-sm" tabindex="0">
                    <h2 class="task-manager__card-title">${title}</h2>

                    <time class="task-manager__card-date">
                        ${year}.${month}.${day} в ${hours}:${minutes}
                    </time>

                    <p class="task-manager__card-description">
                        ${description}
                    </p>

                    <button class="task-manager__card-delete bg-danger border-0 text-white rounded">
                        Удалить
                    </button>

                    <a class="task-manager__card-link" href="editTask.html#${id}">
                        <i class="fas fa-pen-square"></i>
                    </a>
                </div>
            </li>
        `);
    });

    const btnDelete = document.querySelectorAll('.task-manager__card-delete');

    btnDelete.forEach(item => {
        item.addEventListener('click', (e) => {
            const task = e.target.closest('li');
            const taskId = task.dataset.idd;
            let index = 0;

            task.remove();

            tasks.forEach((item, i) => {
                if (item.id === taskId) {
                    index = i;
                }
            });

            
            tasks.splice(index, 1)
            setLocalStorage('tasks', tasks);
            checkEmptyList(tasks, cardsList);

        });
    });
}

function sortTasks(e) {
    const target = e.target;
    const cardsList = document.querySelector('.task-manager__cards');
    const allCards = document.querySelectorAll('.task-card');
    let cardsSorted;

    if (target.value === 'new') {
        cardsSorted = [...allCards].sort((a, b) => +a.dataset.timestamp - +b.dataset.timestamp);

    } else if (target.value === 'old') {
        cardsSorted = [...allCards].sort((a, b) => +b.dataset.timestamp - +a.dataset.timestamp);

    } else {
        renderCard();
        return;
    }

    cardsList.textContent = '';

    for (let item of cardsSorted) {
        cardsList.insertAdjacentElement('beforeend', item);
    }
}

function addNewTask(e) {
    e.preventDefault();
    let titleTask = this.title.value;
    let descriptionTask = this.description.value;
    let timestampTask = new Date(this.date.value).getTime();
    console.log(timestampTask);
    let getData = getLocalStorage('tasks');
    let taskMessage = document.querySelector('.new-task__message');
    let taskId = generateId();



    let data = {
        id: taskId,
        title: titleTask,
        description: descriptionTask,
        timestamp: timestampTask,
    };

    getData.push(data);

    this.reset();

    setLocalStorage('tasks', getData);
    taskMessage.classList.add('created');

    setInterval( () => {
        taskMessage.classList.remove('created');
    }, 3000);
        
    
}

function editTask() {
    const idTask = location.hash.slice(1);
    const taskForm = document.querySelector('.new-task__form');
    const taskMessage = document.querySelector('.new-task__message');
    const taskDelete = document.querySelector('.new-task__delete');

    let task = null;
    let taskIndex = 0;
    let taskData = getLocalStorage('tasks');

    taskData.forEach((item, i) => {
        if (item.id.includes(idTask)) {
            task = item;
            taskIndex = i;
        }
    });

    let dateTask = new Date(task.timestamp);
    dateTask = `${dateTask.getFullYear()}-${addZero(dateTask.getMonth() + 1)}-${addZero(dateTask.getDate())} ${addZero(dateTask.getHours())}:${addZero(dateTask.getMinutes())}`;

    taskForm.title.value = task.title;
    taskForm.description.value = task.description;
    taskForm.dateTime.value = dateTask;

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        task.title = taskForm.title.value;
        task.description = taskForm.description.value;
        task.timestamp = new Date(taskForm.dateTime.value).getTime();

        taskData[taskIndex] = task;

        setLocalStorage('tasks', taskData);
        taskMessage.classList.add('created');


        setInterval(() => {
            taskMessage.classList.remove('created');
        }, 3000);

    });

    taskDelete.addEventListener('click', () => {
        let tasksData = getLocalStorage('tasks');
        let index = 0;    

        tasksData.forEach((item, i) => {
            if (item.id === idTask) {
                index = i;
            }
        });

        tasksData.splice(index, 1)
        setLocalStorage('tasks', tasksData);

        taskForm.textContent = 'Задача была удалена';
    });

}

function getLocalStorage(key) {
    return localStorage.getItem(key) ?
        JSON.parse(localStorage.getItem(key)) :
        [];
}

function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function addZero(num) {
    if (num < 10) {
        return '0' + num;
    } else {
        return num;
    }
}


function byteToHex(byte) {
    return ('0' + byte.toString(16)).slice(-2);
}

function generateHash(len = 40) {
    let arr = new Uint8Array(len / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, byteToHex).join("");
}

function generateId() {
    let id = generateHash();
    let data = getLocalStorage('tasks');

    data.forEach(item => {
        if (item.id.includes(id)) {
            return generateId();
        } else {
            return;
        }
    });

    return id;

}

function checkEmptyList(list, container) {
    if (list.length === 0) {
        container.textContent = 'Список пуст';
    }
}
