const SUPABASE_URL = "https://cithfqbzszgiqjifhrqy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_0mGHHS1HcRHh0Ttt8sZwtA_MBI22p1w";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// 이미지 크게 보기에 필요한 요소
const routineImage = document.querySelector("#routineImage");
const openImageButton = document.querySelector("#openImageButton");
const imageModal = document.querySelector("#imageModal");
const closeImageButton = document.querySelector("#closeImageButton");


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
// 회원 로그인에 필요한 화면 요소
const loginScreen = document.querySelector("#loginScreen");
const appScreen = document.querySelector("#appScreen");
const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const loginButton = document.querySelector("#loginButton");
const loginMessage = document.querySelector("#loginMessage");
const assignedRoutineName = document.querySelector("#assignedRoutineName");
const logoutButton = document.querySelector("#logoutButton");

// 로그인한 회원에게 배정된 최신 루틴 불러오기
async function loadMemberRoutine() {
  const routineElements = [
    routineImage.closest(".routine-image"),
    openImageButton
  ];

  // 데이터를 확인하기 전에는 기존 예제 루틴 숨기기
  routineElements.forEach((element) => {
    element.hidden = true;
  });

  const { data, error } = await supabaseClient
    .from("member_routines")
    .select("routine_name, routine_image_url")
    .eq("is_active", true)
    .order("assigned_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("루틴 불러오기 실패:", error);
    assignedRoutineName.textContent = "루틴을 불러오지 못했습니다.";
    return;
  }

  if (!data) {
    assignedRoutineName.textContent = "배정된 루틴이 없습니다.";
    return;
  }

  assignedRoutineName.textContent = data.routine_name;
  routineImage.src = data.routine_image_url;
  routineImage.alt = data.routine_name;

  // 배정된 데이터가 있을 때만 루틴 표시
  routineElements.forEach((element) => {
    element.hidden = false;
  });
}

// 로그인 후 운동 앱 표시
async function showWorkoutApp() {
  loginScreen.hidden = true;
  appScreen.hidden = false;
  await loadMemberRoutine();
}

// 로그인 버튼 기능
loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  loginMessage.textContent = "로그인 중...";
  loginButton.disabled = true;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: loginEmail.value.trim(),
    password: loginPassword.value
  });

  if (error) {
    loginMessage.textContent = "이메일 또는 비밀번호를 확인해 주세요.";
    loginButton.disabled = false;
    return;
  }

  loginMessage.textContent = "";
  loginForm.reset();
  loginButton.disabled = false;
  await showWorkoutApp();
});

// 이미 로그인한 상태인지 확인
async function initializeLogin() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session) {
    await showWorkoutApp();
  }
}

logoutButton.addEventListener("click", async function () {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert("로그아웃하지 못했습니다. 다시 시도해 주세요.");
    return;
  }

  appScreen.hidden = true;
  loginScreen.hidden = false;
  loginMessage.textContent = "";
});
initializeLogin();