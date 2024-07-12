document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('.progress-checkbox');

    // Load progress from localStorage
    checkboxes.forEach(checkbox => {
        const id = checkbox.dataset.id;
        if (localStorage.getItem(id) === 'completed') {
            checkbox.checked = true;
        }
    });

    // Check the status of each section on load
    document.querySelectorAll('section').forEach(section => {
        if (Array.from(section.querySelectorAll('.progress-checkbox')).every(checkbox => checkbox.checked)) {
            section.classList.add('completed');
        }
    });

    // Save progress to localStorage and check section status
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const id = checkbox.dataset.id;
            if (checkbox.checked) {
                localStorage.setItem(id, 'completed');
            } else {
                localStorage.removeItem(id);
            }

            // Check if all checkboxes in the section are checked
            const section = checkbox.closest('section');
            if (Array.from(section.querySelectorAll('.progress-checkbox')).every(cb => cb.checked)) {
                section.classList.add('completed');
            } else {
                section.classList.remove('completed');
            }
        });
    });
});
