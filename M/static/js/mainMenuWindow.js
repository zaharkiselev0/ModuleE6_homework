/* Логика работы с модальным окном меню */

const menuButton = document.getElementById('menuButton');
const modalMenu = document.getElementById('modalMenu');
const closeBtn = document.getElementById('closeBtn');

menuButton.addEventListener('click', () => {
    modalMenu.classList.add('active');
});

closeBtn.addEventListener('click', closeModal);
modalMenu.addEventListener('click', (e) => {
    if(e.target === modalMenu) closeModal();
});

function closeModal() {
    modalMenu.classList.remove('active');
}

document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') closeModal();
});