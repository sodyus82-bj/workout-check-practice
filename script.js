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
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .catch((error) => {
        console.error("서비스워커 등록 실패:", error);
      });
  });
}
// 홈 화면 설치 기능
const installButton = document.getElementById("installButton");

let deferredInstallPrompt = null;

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

// 이미 설치된 상태가 아니라면 버튼 표시
if (!isStandalone) {
  installButton.hidden = false;

  if (isIos) {
    installButton.textContent = "📲 아이폰 설치 방법";
  }
}

// 안드로이드·PC에서 설치 준비가 완료되었을 때
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
});

// 설치 버튼 클릭
installButton.addEventListener("click", async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();

    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;

    if (choice.outcome === "accepted") {
      installButton.hidden = true;
    }

    return;
  }

  if (isIos) {
    alert(
      "Safari의 공유 버튼을 누른 뒤 ‘홈 화면에 추가’를 선택하고, 마지막으로 ‘추가’를 눌러주세요."
    );
    return;
  }

  alert("브라우저 메뉴에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택해주세요.");
});

// 설치가 완료되면 버튼 숨기기
window.addEventListener("appinstalled", () => {
  installButton.hidden = true;
  deferredInstallPrompt = null;
});