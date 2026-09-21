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
// 로그인과 화면 전환에 필요한 요소
const loginScreen = document.querySelector("#loginScreen");
const appScreen = document.querySelector("#appScreen");
const adminScreen = document.querySelector("#adminScreen");

const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const loginButton = document.querySelector("#loginButton");
const loginMessage = document.querySelector("#loginMessage");

const assignedRoutineName = document.querySelector("#assignedRoutineName");
const routineDescription = document.querySelector("#routineDescription");
const logoutButton = document.querySelector("#logoutButton");

const adminMemberSelect = document.querySelector("#adminMemberSelect");
const adminMemberInfo = document.querySelector("#adminMemberInfo");
const adminRoutineEditor = document.querySelector("#adminRoutineEditor");
const adminLogoutButton = document.querySelector("#adminLogoutButton");
const adminRoutineName = document.querySelector("#adminRoutineName");
const adminRoutineImage = document.querySelector("#adminRoutineImage");
const adminRoutinePreview = document.querySelector("#adminRoutinePreview");
const adminRoutineDescription = document.querySelector("#adminRoutineDescription");
const saveAdminRoutineButton = document.querySelector("#saveAdminRoutineButton");
const adminSaveMessage = document.querySelector("#adminSaveMessage");
function appendTextWithLinks(container, text) {
  const urlPattern = /https?:\/\/[^\s]+/g;
  let lastIndex = 0;

  for (const match of text.matchAll(urlPattern)) {
    const url = match[0];

    container.append(
      document.createTextNode(text.slice(lastIndex, match.index))
    );

    const link = document.createElement("a");
    link.href = url;
    link.textContent = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    container.append(link);

    lastIndex = match.index + url.length;
  }

  container.append(document.createTextNode(text.slice(lastIndex)));
}

function renderRoutineDescription(description) {
  routineDescription.replaceChildren();

  if (!description || !description.trim()) {
    routineDescription.hidden = true;
    return;
  }

  description.trim().split(/\n+/).forEach((line) => {
    const paragraph = document.createElement("p");
    appendTextWithLinks(paragraph, line);
    routineDescription.append(paragraph);
  });

  routineDescription.hidden = false;
}
// 회원에게 배정된 최신 루틴 불러오기
async function loadMemberRoutine(userId) {
  const routineElements = [
    routineImage.closest(".routine-image"),
    openImageButton
  ];

  routineElements.forEach((element) => {
    element.hidden = true;
    routineDescription.hidden = true;
  });

  const { data, error } = await supabaseClient
    .from("member_routines")
    .select("routine_name, routine_image_url, routine_image_path, routine_description")
    .eq("user_id", userId)
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

  let imageUrl = data.routine_image_url;

  if (data.routine_image_path) {
    const { data: signedUrlData, error: signedUrlError } =
      await supabaseClient.storage
        .from("routine-images")
        .createSignedUrl(data.routine_image_path, 60 * 60);

    if (signedUrlError) {
      console.error("루틴 이미지 주소 생성 실패:", signedUrlError);
      assignedRoutineName.textContent = "루틴 이미지를 불러오지 못했습니다.";
      return;
    }

    imageUrl = signedUrlData.signedUrl;
  }

  if (!imageUrl) {
    assignedRoutineName.textContent = "루틴 이미지가 없습니다.";
    return;
  }

  assignedRoutineName.textContent = data.routine_name;
    renderRoutineDescription(data.routine_description);
  routineImage.src = imageUrl;
  routineImage.alt = data.routine_name;

  imageModal.querySelector("img").src = imageUrl;
  imageModal.querySelector("img").alt = `${data.routine_name} 확대 이미지`;

  routineElements.forEach((element) => {
    element.hidden = false;
  });
}

// 일반 회원 화면 표시
async function showWorkoutApp(userId) {
  loginScreen.hidden = true;
  adminScreen.hidden = true;
  appScreen.hidden = false;

  await loadMemberRoutine(userId);
}

// 관리자용 회원 목록 불러오기
async function loadAdminMembers() {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, display_name, email")
    .eq("role", "member")
    .order("email");

  if (error) {
    console.error("회원 목록 불러오기 실패:", error);
    adminMemberSelect.innerHTML =
      '<option value="">회원 목록을 불러오지 못했습니다.</option>';
    return;
  }

  if (!data || data.length === 0) {
    adminMemberSelect.innerHTML =
      '<option value="">등록된 회원이 없습니다.</option>';
    return;
  }

  adminMemberSelect.innerHTML =
    '<option value="">루틴을 관리할 회원을 선택하세요.</option>';

  data.forEach((member) => {
    const option = document.createElement("option");
    option.value = member.id;
    option.textContent = `${member.display_name} (${member.email})`;
    adminMemberSelect.append(option);
  });
}

// 관리자 화면 표시
async function showAdminApp() {
  loginScreen.hidden = true;
  appScreen.hidden = true;
  adminScreen.hidden = false;

  adminRoutineEditor.hidden = true;
  adminMemberInfo.textContent = "루틴을 관리할 회원을 선택해 주세요.";

  await loadAdminMembers();
}

// 현재 로그인한 계정의 역할에 따라 화면 선택
async function showScreenForCurrentUser() {
  const {
    data: { user },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    loginMessage.textContent = "로그인 정보를 확인하지 못했습니다.";
    return;
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

    if (profileError || !profile) {
      console.error("회원 역할 확인 실패:", profileError);
    
      loginMessage.textContent = profileError
        ? `회원 정보 오류: ${profileError.message}`
        : "회원 정보 오류: 프로필이 없습니다.";
    
      return;
    }

  if (profile.role === "admin") {
    await showAdminApp();
    return;
  }

  await showWorkoutApp(user.id);
}

// 관리자 화면에서 회원을 선택했을 때
adminMemberSelect.addEventListener("change", function () {
  const selectedOption =
    adminMemberSelect.options[adminMemberSelect.selectedIndex];

  if (!adminMemberSelect.value) {
    adminRoutineEditor.hidden = true;
    adminMemberInfo.textContent = "루틴을 관리할 회원을 선택해 주세요.";
    return;
  }

  adminRoutineEditor.hidden = false;
  adminMemberInfo.textContent =
    `${selectedOption.textContent} 회원의 루틴을 설정합니다.`;
});
adminRoutineImage.addEventListener("change", function () {
  const selectedFile = adminRoutineImage.files[0];

  if (!selectedFile) {
    adminRoutinePreview.hidden = true;
    return;
  }

  adminRoutinePreview.src = URL.createObjectURL(selectedFile);
  adminRoutinePreview.hidden = false;
});

saveAdminRoutineButton.addEventListener("click", async function () {
  const userId = adminMemberSelect.value;
  const routineName = adminRoutineName.value.trim();
  const description = adminRoutineDescription.value.trim();
  const selectedFile = adminRoutineImage.files[0];

  if (!userId) {
    adminSaveMessage.textContent = "먼저 회원을 선택해 주세요.";
    return;
  }

  if (!routineName) {
    adminSaveMessage.textContent = "루틴 이름을 입력해 주세요.";
    return;
  }

  if (!selectedFile) {
    adminSaveMessage.textContent = "루틴 이미지를 선택해 주세요.";
    return;
  }

  if (!selectedFile.type.startsWith("image/")) {
    adminSaveMessage.textContent = "이미지 파일만 선택할 수 있습니다.";
    return;
  }

  if (selectedFile.size > 10 * 1024 * 1024) {
    adminSaveMessage.textContent = "이미지 파일은 10MB 이하만 올릴 수 있습니다.";
    return;
  }

  saveAdminRoutineButton.disabled = true;
  adminSaveMessage.textContent = "루틴 이미지를 저장 중입니다...";

  const safeFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const imagePath = `${userId}/${Date.now()}-${safeFileName}`;

  const { error: uploadError } = await supabaseClient.storage
    .from("routine-images")
    .upload(imagePath, selectedFile, {
      cacheControl: "3600",
      upsert: false
    });

  if (uploadError) {
    console.error("이미지 업로드 실패:", uploadError);
    adminSaveMessage.textContent = "이미지를 저장하지 못했습니다.";
    saveAdminRoutineButton.disabled = false;
    return;
  }

  const { data: newRoutine, error: insertError } = await supabaseClient
    .from("member_routines")
    .insert({
      user_id: userId,
      routine_name: routineName,
      routine_image_url: "",
      routine_image_path: imagePath,
      routine_description: description,
      is_active: true
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("루틴 정보 저장 실패:", insertError);
    adminSaveMessage.textContent = "루틴 정보를 저장하지 못했습니다.";
    saveAdminRoutineButton.disabled = false;
    return;
  }

  const { error: deactivateError } = await supabaseClient
    .from("member_routines")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("is_active", true)
    .neq("id", newRoutine.id);

  if (deactivateError) {
    console.error("기존 루틴 비활성화 실패:", deactivateError);
  }

  adminSaveMessage.textContent =
    "저장했습니다. 회원이 다시 로그인하면 새 루틴이 표시됩니다.";

  adminRoutineImage.value = "";
  adminRoutineDescription.value = "";
  saveAdminRoutineButton.disabled = false;
});
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

  await showScreenForCurrentUser();
});

// 이미 로그인한 상태인지 확인
async function initializeLogin() {
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session) {
    await showScreenForCurrentUser();
  }
}

// 로그아웃 공통 기능
async function handleLogout() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert("로그아웃하지 못했습니다. 다시 시도해 주세요.");
    return;
  }

  appScreen.hidden = true;
  adminScreen.hidden = true;
  loginScreen.hidden = false;
  loginMessage.textContent = "";
}

logoutButton.addEventListener("click", handleLogout);
adminLogoutButton.addEventListener("click", handleLogout);

initializeLogin();