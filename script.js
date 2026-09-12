// 운동 체크 기능에 필요한 요소
const completeButtons = document.querySelectorAll(".complete-button");
const workoutCards = document.querySelectorAll(".workout-card");
const progressText = document.querySelector("#progressText");
const resetButton = document.querySelector("#resetButton");

// 이미지 크게 보기에 필요한 요소
const routineImage = document.querySelector("#routineImage");
const openImageButton = document.querySelector("#openImageButton");
const imageModal = document.querySelector("#imageModal");
const closeImageButton = document.querySelector("#closeImageButton");

// 완료된 운동 개수를 계산해서 화면에 표시
function updateProgress() {
  const completedCards = document.querySelectorAll(
    ".workout-card.completed"
  );

  progressText.textContent =
    `${completedCards.length} / ${workoutCards.length} 완료`;
}

// 각각의 완료 버튼에 클릭 기능 연결
completeButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const card = button.closest(".workout-card");

    card.classList.toggle("completed");

    if (card.classList.contains("completed")) {
      button.textContent = "완료됨";
    } else {
      button.textContent = "완료";
    }

    updateProgress();
  });
});

// 전체 초기화 버튼
resetButton.addEventListener("click", function () {
  workoutCards.forEach(function (card) {
    card.classList.remove("completed");
  });

  completeButtons.forEach(function (button) {
    button.textContent = "완료";
  });

  updateProgress();
});

// 확대 화면 열기
function openImageModal() {
  imageModal.classList.add("open");
  document.body.classList.add("modal-open");
}

// 확대 화면 닫기
function closeImageModal() {
  imageModal.classList.remove("open");
  document.body.classList.remove("modal-open");
}

// 원본 이미지와 크게 보기 버튼에 열기 기능 연결
routineImage.addEventListener("click", openImageModal);
openImageButton.addEventListener("click", openImageModal);

// X 버튼에 닫기 기능 연결
closeImageButton.addEventListener("click", closeImageModal);

// 이미지 바깥의 어두운 영역을 누르면 닫기
imageModal.addEventListener("click", function (event) {
  if (event.target === imageModal) {
    closeImageModal();
  }
});

// 키보드의 ESC를 누르면 닫기
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeImageModal();
  }
});