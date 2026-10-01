const hamburger = document.querySelector(".nav-toggle");
const menu = document.querySelector(".nav-menu");

hamburger.addEventListener('click', ()=>{
  const isOpen = menu.classList.toggle('active');
hamburger.setAttribute("aria-expanded",String(isOpen));

})
const defaultTeamMembers = [
  {
    name: "John Daniel",
    role: "Frontend Engineer",
    image: "images/first man.jpg"
  },
  {
    name: "Mikey Miller",
    role: "Full-Stack Developer",
    image: "images/second man.jpg"
  },
  {
    name: "Yunus Musa",
    role: "UI Engineer",
    image: "images/third man.jpg"
  },
  {
    name: "Usman Ahmed",
    role: "Backend Developer",
    image: "images/fourth man.jpg"
  }
];

// Load from localStorage (if exists), otherwise use defaults
const stored = localStorage.getItem("teamMembers");
const teamMembers = stored ? JSON.parse(stored) : defaultTeamMembers;

// helper to save whenever teamMembers changes
function saveTeamMembers() {
  localStorage.setItem("teamMembers", JSON.stringify(teamMembers));
}

const grid = document.querySelector(".feature-grid");

function team(list = teamMembers){
return list.map(({name,role,image},index)=>{
 return ` <article class="feature-card" data-index="${index}">
          <img src="${image}" alt="${name}">
          <h3>${name}</h3>
          <p>${role}</p>
          <button type="button" class="btn-delete" aria-label="Delete ${name}">&times;</button>
        </article>`;
}).join('');
}
grid.innerHTML = team();

const searchInput =document.getElementById("searchInput");
searchInput.addEventListener("input",(e)=>{
const searchTerm = e.target.value.toLowerCase();
const filteredMembers = teamMembers.filter(({name,role}) => 
  name.toLowerCase().includes(searchTerm) ||
  role.toLowerCase().includes(searchTerm)
);
 

grid.innerHTML = team(filteredMembers);
})

// ==============================
// FEATURE CARD DETAILS MODAL
// ==============================

const modalBody = document.querySelector("#modalOverlay .modal-body");
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");

grid.addEventListener("click", (e) => {
  const card = e.target.closest(".feature-card");
  // Filter/delete by name instead of index:
if (e.target.classList.contains("btn-delete")) {
  e.stopPropagation();
  const card = e.target.closest(".feature-card");
  const memberName = card.querySelector("img")?.getAttribute("alt");

  // Find index in master array
  const targetIndex = teamMembers.findIndex((m) => m.name === memberName);

  if (targetIndex !== -1) {
    teamMembers.splice(targetIndex, 1);
    saveTeamMembers();
    
    // Maintain current search state on re-render
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filtered = teamMembers.filter(({ name, role }) =>
      name.toLowerCase().includes(searchTerm) ||
      role.toLowerCase().includes(searchTerm)
    );
    
    grid.innerHTML = team(filtered);
  }
  return;
}

  if (!card) return;

 const memberName = card.querySelector("img")?.getAttribute("alt");

const member = teamMembers.find(
  (member) => member.name === memberName
);


  if (!member)return 
    modalBody.innerHTML = `
      <article class="feature-card">
        <img src="${member.image}" alt="${member.name}">
        <h3>${member.name}</h3>
        <p>${member.role}</p>
      </article>
    `;

    modalOverlay.classList.add("active");
  
});

// Close feature-card modal
modalClose.addEventListener("click", () => {
  modalOverlay.classList.remove("active");
});

// Close feature-card modal by clicking outside
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove("active");
  }
});


// ==============================
// ADD ENGINEER FORM MODAL
// ==============================

const addBtn = document.getElementById("openFormBtn");
const formModal = document.getElementById("formModalOverlay");
const formModalClose = document.getElementById("formModalClose");


// Open form modal
addBtn.addEventListener("click", () => {
  formModal.setAttribute("aria-hidden", "false");
  formModal.classList.add("active");
});


// Close form modal
formModalClose.addEventListener("click", () => {
  formModal.classList.remove("active");
  formModal.setAttribute("aria-hidden", "true");
});


// Close form modal by clicking outside
formModal.addEventListener("click", (e) => {
  if (e.target === formModal) {
    formModal.classList.remove("active");
    formModal.setAttribute("aria-hidden", "true");
  }
});


const names = document.querySelector("#memberName");
const role = document.getElementById("memberRole");
const imj = document.getElementById("memberImage");
const submitBtn = document.querySelector(".form-submit-btn");
const form = document.getElementById("addMemberForm");

form.addEventListener("submit",(e)=>{
e.preventDefault();
const nameInput = names.value.trim();
const roleInput = role.value.trim();
const imjInput = imj.value.trim();
if (!nameInput) {
  alert("Name is required!");
  return;
}
teamMembers.push({name:nameInput,role:roleInput,image:imjInput});
grid.innerHTML = team(teamMembers);
saveTeamMembers();    
  form.reset(); // Clears text fields
  formModal.classList.remove("active");
})

// Make sure this ID matches your container div in index.html
const teamContainer = document.getElementById("team-container");

async function fetchAndRenderTeam(searchTerm = "") {
  // Show a quick loading message while waiting for the network
  teamContainer.innerHTML = "<p>Loading team members...</p>";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(),3000);

let url = "https://jsonplaceholder.typicode.com/users";
  if (searchTerm) {
    url += `?name=${encodeURIComponent(searchTerm)}`;
  }

  try {
    // Await the API response
    const response = await fetch(url, {
       headers : {
        "Content-Type": "application/json"
      },
      signal: controller.signal 
    }
  );

  clearTimeout(timer);

  if(!response.ok){
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const users = await response.json();
if(users.length === 0){
  teamContainer.innerHTML = `<p class="loading-state">No team members found matching "${searchTerm}".</p>`;
      return;
}


    // Map through users array to create card HTML string
    const cardsHTML = users.map(user => `
      <div class="team-card" data-id="${user.id}">
        <h3>${user.name}</h3>
        <p class="role">${user.company.catchPhrase}</p>
        <p class="email">📧 ${user.email}</p>
        <button class="delete-btn" onclick="removeCard(${user.id})">Delete</button>
      </div>
    `).join("");

    // Inject generated HTML straight into your DOM
    teamContainer.innerHTML = cardsHTML;

  } catch (error) {
  if (error.name === "AbortError") {
    teamContainer.innerHTML = `<p class="error">Request timed out. Please check your network connection.</p>`;
  } else {
    teamContainer.innerHTML = `<p class="error">Failed to load team data: ${error.message}</p>`;
  }
}
}

// Simple delete helper function
function removeCard(id) {
  const card = document.querySelector(`.team-card[data-id="${id}"]`);
  if (card) {
    card.remove();
  }
}

// Call function on page load


let deboucerTime;
const searchName = document.querySelector(".search-by-name");
searchName.addEventListener("input",(e)=>{
const searchTerm = e.target.value.trim();
clearTimeout(deboucerTime);
deboucerTime = setTimeout(() => {
  fetchAndRenderTeam(searchTerm);
}, 500);
});
fetchAndRenderTeam();