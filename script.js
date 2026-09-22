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
if (
  "serviceWorker" in navigator &&
  window.location.protocol !== "file:"
) {
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
// 회원 화면 하단 탭
const memberTabButtons =
  document.querySelectorAll("[data-member-tab]");

const memberTabPanels = {
  routine: document.querySelector("#routineTabPanel"),
  workoutLog: document.querySelector("#workoutLogTabPanel"),
  community: document.querySelector("#communityTabPanel")
};

// 선택한 회원 탭 표시
function showMemberTab(tabName) {
  const selectedPanel = memberTabPanels[tabName];

  if (!selectedPanel) {
    return;
  }

  Object.entries(memberTabPanels).forEach(
    ([panelName, panel]) => {
      panel.hidden = panelName !== tabName;
    }
  );

  memberTabButtons.forEach((button) => {
    const isSelected =
      button.dataset.memberTab === tabName;

    button.classList.toggle("is-active", isSelected);
    button.setAttribute(
      "aria-selected",
      String(isSelected)
    );
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// 하단 탭 버튼 클릭 기능
memberTabButtons.forEach((button) => {
  button.addEventListener("click", function () {
    showMemberTab(button.dataset.memberTab);
  });
});
// 운동 기록 캘린더 요소
const workoutCalendarMonthLabel =
  document.querySelector("#workoutCalendarMonthLabel");

const workoutCalendarDays =
  document.querySelector("#workoutCalendarDays");

const previousWorkoutMonthButton =
  document.querySelector("#previousWorkoutMonthButton");

const nextWorkoutMonthButton =
  document.querySelector("#nextWorkoutMonthButton");

// 현재 캘린더에 표시할 월
let visibleWorkoutMonth = new Date();
visibleWorkoutMonth.setDate(1);

// 나중에 Supabase에서 불러올 기록 날짜
let workoutRecordDates = new Set();

// 사용자가 선택한 날짜
let selectedWorkoutDate = "";

// 날짜를 2026-09-22 형태로 만들기
function makeWorkoutDateKey(year, monthIndex, day) {
  const month = String(monthIndex + 1).padStart(2, "0");
  const date = String(day).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

// 운동 기록 캘린더 그리기
function renderWorkoutCalendar() {
  const year = visibleWorkoutMonth.getFullYear();
  const monthIndex = visibleWorkoutMonth.getMonth();

  const firstWeekday =
    new Date(year, monthIndex, 1).getDay();

  const lastDate =
    new Date(year, monthIndex + 1, 0).getDate();

  const today = new Date();

  workoutCalendarMonthLabel.textContent =
    `${year}년 ${monthIndex + 1}월`;

  workoutCalendarDays.innerHTML = "";

  // 이번 달 1일 앞의 빈칸
  for (let index = 0; index < firstWeekday; index += 1) {
    const emptyCell = document.createElement("span");
    emptyCell.className = "workout-calendar-empty";
    emptyCell.setAttribute("aria-hidden", "true");

    workoutCalendarDays.append(emptyCell);
  }

  // 이번 달 날짜
  for (let day = 1; day <= lastDate; day += 1) {
    const dateKey =
      makeWorkoutDateKey(year, monthIndex, day);

    const dateButton = document.createElement("button");

    dateButton.type = "button";
    dateButton.className = "workout-calendar-day";
    dateButton.textContent = String(day);
    dateButton.dataset.date = dateKey;

    dateButton.setAttribute(
      "aria-label",
      `${year}년 ${monthIndex + 1}월 ${day}일`
    );

    const isToday =
      year === today.getFullYear() &&
      monthIndex === today.getMonth() &&
      day === today.getDate();

    if (isToday) {
      dateButton.classList.add("is-today");
    }

    if (workoutRecordDates.has(dateKey)) {
      dateButton.classList.add("has-record");
    }

    if (selectedWorkoutDate === dateKey) {
      dateButton.classList.add("is-selected");
    }

    dateButton.addEventListener("click", function () {
      selectedWorkoutDate =
        selectedWorkoutDate === dateKey
          ? ""
          : dateKey;

      renderWorkoutCalendar();
    });

    workoutCalendarDays.append(dateButton);
  }
}

// 이전 달 보기
previousWorkoutMonthButton.addEventListener(
  "click",
  function () {
    visibleWorkoutMonth.setMonth(
      visibleWorkoutMonth.getMonth() - 1
    );

    selectedWorkoutDate = "";
    renderWorkoutCalendar();
  }
);

// 다음 달 보기
nextWorkoutMonthButton.addEventListener(
  "click",
  function () {
    visibleWorkoutMonth.setMonth(
      visibleWorkoutMonth.getMonth() + 1
    );

    selectedWorkoutDate = "";
    renderWorkoutCalendar();
  }
);

// 로그인할 때 이번 달로 초기화
function resetWorkoutCalendar() {
  visibleWorkoutMonth = new Date();
  visibleWorkoutMonth.setDate(1);
  selectedWorkoutDate = "";

  renderWorkoutCalendar();
}

// 페이지가 처음 열렸을 때 달력 표시
renderWorkoutCalendar();
// 운동 기록 카메라 요소
const openWorkoutCameraButton =
  document.querySelector("#openWorkoutCameraButton");

const workoutCameraModal =
  document.querySelector("#workoutCameraModal");

const closeWorkoutCameraButton =
  document.querySelector("#closeWorkoutCameraButton");

const workoutCameraView =
  document.querySelector("#workoutCameraView");

const workoutCameraVideo =
  document.querySelector("#workoutCameraVideo");

const workoutCameraMessage =
  document.querySelector("#workoutCameraMessage");

const captureWorkoutPhotoButton =
  document.querySelector("#captureWorkoutPhotoButton");

const switchWorkoutCameraButton =
  document.querySelector("#switchWorkoutCameraButton");

const workoutPhotoComposer =
  document.querySelector("#workoutPhotoComposer");

const workoutPhotoCaption =
  document.querySelector("#workoutPhotoCaption");

const workoutRecordSaveMessage =
  document.querySelector("#workoutRecordSaveMessage");
const workoutCameraCanvas =
  document.querySelector("#workoutCameraCanvas");

const workoutPhotoPreview =
  document.querySelector("#workoutPhotoPreview");

const workoutPhotoDate =
  document.querySelector("#workoutPhotoDate");

const retakeWorkoutPhotoButton =
  document.querySelector("#retakeWorkoutPhotoButton");

const saveWorkoutRecordButton =
  document.querySelector("#saveWorkoutRecordButton");

// 현재 실행 중인 카메라 정보
let workoutCameraStream = null;
let workoutCameraFacingMode = "user";
let workoutCameraRequestId = 0;
let capturedWorkoutPhotoBlob = null;
let workoutPhotoPreviewUrl = "";
let workoutPhotoTakenAt = null;

// 촬영한 임시 사진 초기화
function clearCapturedWorkoutPhoto() {
  if (workoutPhotoPreviewUrl) {
    URL.revokeObjectURL(workoutPhotoPreviewUrl);
  }

  workoutPhotoPreviewUrl = "";
  capturedWorkoutPhotoBlob = null;
  workoutPhotoTakenAt = null;

  workoutPhotoPreview.removeAttribute("src");
  workoutPhotoCaption.value = "";
  workoutPhotoDate.textContent = "";
  workoutRecordSaveMessage.textContent = "";
}

// 실행 중인 카메라 끄기
function stopWorkoutCamera() {
  workoutCameraRequestId += 1;

  if (workoutCameraStream) {
    workoutCameraStream
      .getTracks()
      .forEach((track) => track.stop());
  }

  workoutCameraStream = null;
  workoutCameraVideo.srcObject = null;
}

// 카메라 시작
async function startWorkoutCamera() {
  stopWorkoutCamera();

  const currentRequestId = workoutCameraRequestId;

  workoutCameraMessage.hidden = false;
  workoutCameraMessage.textContent =
    "카메라를 준비하고 있습니다.";

  captureWorkoutPhotoButton.disabled = true;
  switchWorkoutCameraButton.disabled = true;

  workoutCameraVideo.classList.toggle(
    "is-front-facing",
    workoutCameraFacingMode === "user"
  );

  try {
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      throw new Error("CAMERA_NOT_SUPPORTED");
    }

    const cameraStream =
    await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: {
          ideal: workoutCameraFacingMode
        },
        width: {
          ideal: 1200
        },
        height: {
          ideal: 1600
        },
        aspectRatio: {
          ideal: 3 / 4
        },
        resizeMode: "crop-and-scale"
      }
    });

    // 기다리는 동안 화면을 닫았거나 다른 카메라로 바꾼 경우
    if (
      currentRequestId !== workoutCameraRequestId ||
      workoutCameraModal.hidden
    ) {
      cameraStream
        .getTracks()
        .forEach((track) => track.stop());

      return;
    }

    workoutCameraStream = cameraStream;
    workoutCameraVideo.srcObject = cameraStream;

    await workoutCameraVideo.play();

    workoutCameraMessage.hidden = true;
    captureWorkoutPhotoButton.disabled = false;

  } catch (cameraError) {
    console.error("카메라 실행 실패:", cameraError);

    workoutCameraMessage.hidden = false;

    if (cameraError.name === "NotAllowedError") {
      workoutCameraMessage.textContent =
        "카메라 권한이 필요합니다. " +
        "브라우저 설정에서 카메라 사용을 허용해 주세요.";

    } else if (cameraError.name === "NotFoundError") {
      workoutCameraMessage.textContent =
        "사용할 수 있는 카메라를 찾지 못했습니다.";

    } else if (window.location.protocol === "file:") {
      workoutCameraMessage.textContent =
        "로컬 파일에서는 카메라가 제한될 수 있습니다. " +
        "GitHub Pages에 올린 앱에서 다시 확인해 주세요.";

    } else {
      workoutCameraMessage.textContent =
        "카메라를 실행하지 못했습니다. " +
        "잠시 후 다시 시도해 주세요.";
    }

  } finally {
    switchWorkoutCameraButton.disabled = false;
  }
}

// 카메라 화면 열기
async function openWorkoutCamera() {
  workoutCameraModal.hidden = false;
  workoutCameraView.hidden = false;
  workoutPhotoComposer.hidden = true;

  workoutRecordSaveMessage.textContent = "";

  document.body.classList.add("camera-open");

  workoutCameraFacingMode = "user";

  await startWorkoutCamera();
}

// 카메라 화면 닫기
function closeWorkoutCamera() {
  stopWorkoutCamera();
  clearCapturedWorkoutPhoto();

  workoutCameraModal.hidden = true;
  workoutCameraView.hidden = false;
  workoutPhotoComposer.hidden = true;

  document.body.classList.remove("camera-open");
}

// 전면·후면 카메라 전환
async function switchWorkoutCamera() {
  workoutCameraFacingMode =
    workoutCameraFacingMode === "user"
      ? "environment"
      : "user";

  await startWorkoutCamera();
}
// 현재 카메라 화면 촬영
async function captureWorkoutPhoto() {
  const sourceWidth = workoutCameraVideo.videoWidth;
  const sourceHeight = workoutCameraVideo.videoHeight;

  if (!sourceWidth || !sourceHeight) {
    workoutCameraMessage.hidden = false;
    workoutCameraMessage.textContent =
      "카메라 준비가 끝난 뒤 다시 촬영해 주세요.";

    return;
  }

  captureWorkoutPhotoButton.disabled = true;

  try {
    const maximumSize = 1600;

    const imageScale = Math.min(
      1,
      maximumSize / Math.max(sourceWidth, sourceHeight)
    );

    workoutCameraCanvas.width =
      Math.round(sourceWidth * imageScale);

    workoutCameraCanvas.height =
      Math.round(sourceHeight * imageScale);

    const drawingContext =
      workoutCameraCanvas.getContext("2d");

    drawingContext.save();

    // 전면 카메라는 화면에 보이는 방향대로 저장
    if (workoutCameraFacingMode === "user") {
      drawingContext.translate(
        workoutCameraCanvas.width,
        0
      );

      drawingContext.scale(-1, 1);
    }

    drawingContext.drawImage(
      workoutCameraVideo,
      0,
      0,
      workoutCameraCanvas.width,
      workoutCameraCanvas.height
    );

    drawingContext.restore();

    const photoBlob = await new Promise((resolve) => {
      workoutCameraCanvas.toBlob(
        resolve,
        "image/jpeg",
        0.82
      );
    });

    if (!photoBlob) {
      throw new Error("PHOTO_CREATION_FAILED");
    }

    clearCapturedWorkoutPhoto();

    capturedWorkoutPhotoBlob = photoBlob;
    workoutPhotoTakenAt = new Date();

    workoutPhotoPreviewUrl =
      URL.createObjectURL(photoBlob);

    workoutPhotoPreview.src =
      workoutPhotoPreviewUrl;

    workoutPhotoDate.textContent =
      new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(workoutPhotoTakenAt);

    stopWorkoutCamera();

    workoutCameraView.hidden = true;
    workoutPhotoComposer.hidden = false;

    workoutPhotoCaption.focus();

  } catch (photoError) {
    console.error("사진 촬영 실패:", photoError);

    workoutCameraMessage.hidden = false;
    workoutCameraMessage.textContent =
      "사진을 만들지 못했습니다. 다시 촬영해 주세요.";

  } finally {
    captureWorkoutPhotoButton.disabled = false;
  }
}

// 다시 찍기
async function retakeWorkoutPhoto() {
  clearCapturedWorkoutPhoto();

  workoutPhotoComposer.hidden = true;
  workoutCameraView.hidden = false;

  await startWorkoutCamera();
}

// 카메라 버튼 기능 연결
openWorkoutCameraButton.addEventListener(
  "click",
  openWorkoutCamera
);

closeWorkoutCameraButton.addEventListener(
  "click",
  closeWorkoutCamera
);

switchWorkoutCameraButton.addEventListener(
  "click",
  switchWorkoutCamera
);
captureWorkoutPhotoButton.addEventListener(
  "click",
  captureWorkoutPhoto
);

retakeWorkoutPhotoButton.addEventListener(
  "click",
  retakeWorkoutPhoto
);
const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const loginButton = document.querySelector("#loginButton");
const loginMessage = document.querySelector("#loginMessage");
const showSignupButton = document.querySelector("#showSignupButton");
const signupForm = document.querySelector("#signupForm");
const signupName = document.querySelector("#signupName");
const signupPhoneLast4 = document.querySelector("#signupPhoneLast4");
const signupEmail = document.querySelector("#signupEmail");
const signupPassword = document.querySelector("#signupPassword");
const signupPasswordConfirm = document.querySelector(
  "#signupPasswordConfirm"
);
const signupButton = document.querySelector("#signupButton");
const signupMessage = document.querySelector("#signupMessage");
const hideSignupButton = document.querySelector("#hideSignupButton");
const assignedRoutineName = document.querySelector("#assignedRoutineName");
const routineDescription = document.querySelector("#routineDescription");
const toggleRoutineDescriptionButton = document.querySelector(
  "#toggleRoutineDescriptionButton"
);
const logoutButton = document.querySelector("#logoutButton");

const adminMemberSearch = document.querySelector("#adminMemberSearch");
const adminMemberSelect = document.querySelector("#adminMemberSelect");
const adminMemberInfo = document.querySelector("#adminMemberInfo");

let adminMemberOptionCache = [];
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
  routineDescription.classList.remove("is-expanded");

  if (!description || !description.trim()) {
    routineDescription.hidden = true;
    toggleRoutineDescriptionButton.hidden = true;
    return;
  }

  description.trim().split(/\n+/).forEach((line) => {
    const paragraph = document.createElement("p");

    appendTextWithLinks(paragraph, line);

    routineDescription.append(paragraph);
  });

  routineDescription.hidden = false;
  toggleRoutineDescriptionButton.hidden = false;
  toggleRoutineDescriptionButton.textContent = "설명 더 보기";
  toggleRoutineDescriptionButton.setAttribute("aria-expanded", "false");
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

  showMemberTab("routine");
  resetWorkoutCalendar();

  await loadMemberRoutine(userId);
}

// 관리자용 회원 목록 불러오기
async function loadAdminMembers() {
  const [
    { data: members, error: membersError },
    { data: routines, error: routinesError }
  ] = await Promise.all([
    supabaseClient
      .from("profiles")
      .select("id, display_name, email, phone_last4, created_at")
      .eq("role", "member")
      .order("created_at", { ascending: false }),

    supabaseClient
      .from("member_routines")
      .select(
        "user_id, routine_name, routine_image_path, is_active, assigned_at"
      )
      .order("assigned_at", { ascending: false })
  ]);

  if (membersError || routinesError) {
    console.error(
      "관리자 회원 정보 불러오기 실패:",
      membersError || routinesError
    );

    adminMemberSelect.innerHTML =
      '<option value="">회원 목록을 불러오지 못했습니다.</option>';

    return;
  }

  if (!members || members.length === 0) {
    adminMemberSelect.innerHTML =
      '<option value="">등록된 회원이 없습니다.</option>';

    return;
  }

  const routineSummaryByUser = new Map();

  (routines || []).forEach((routine) => {
    const summary = routineSummaryByUser.get(routine.user_id) || {
      assignmentCount: 0,
      currentRoutineName: "",
      currentRoutineImagePath: ""
    };

    summary.assignmentCount += 1;

    if (routine.is_active && !summary.currentRoutineName) {
      summary.currentRoutineName = routine.routine_name;
      summary.currentRoutineImagePath =
        routine.routine_image_path || "";
    }

    routineSummaryByUser.set(routine.user_id, summary);
  });

  adminMemberSelect.innerHTML =
    '<option value="">루틴을 관리할 회원을 선택하세요.</option>';

  members.forEach((member) => {
    const option = document.createElement("option");
    const memberName = member.display_name || "이름 없음";
    const phoneText = member.phone_last4
      ? ` · ${member.phone_last4}`
      : "";

    const summary = routineSummaryByUser.get(member.id) || {
      assignmentCount: 0,
      currentRoutineName: "",
      currentRoutineImagePath: ""
    };

    const routineStatus = summary.currentRoutineName
      ? "루틴 있음"
      : "루틴 없음";

    option.value = member.id;
    option.dataset.memberName = memberName;
    option.dataset.email = member.email || "";
    option.dataset.assignmentCount = String(summary.assignmentCount);
    option.dataset.currentRoutineName = summary.currentRoutineName;
    option.dataset.currentRoutineImagePath =
      summary.currentRoutineImagePath;
    option.textContent =
      `${memberName}${phoneText} · ` +
      `${summary.assignmentCount}회 배정 · ${routineStatus}`;

    adminMemberSelect.append(option);
  });

  adminMemberOptionCache = Array.from(
    adminMemberSelect.options
  )
    .slice(1)
    .map((option) => option.cloneNode(true));
}
// 관리자 회원 검색
adminMemberSearch.addEventListener("input", function () {
  const searchText =
    adminMemberSearch.value.trim().toLowerCase();

  const matchingOptions = adminMemberOptionCache.filter(
    (option) => {
      const optionText =
        option.textContent.toLowerCase();

      const email =
        (option.dataset.email || "").toLowerCase();

      return `${optionText} ${email}`.includes(searchText);
    }
  );

  adminMemberSelect.innerHTML =
    '<option value="">루틴을 관리할 회원을 선택하세요.</option>';

  if (matchingOptions.length === 0) {
    const noResultOption =
      document.createElement("option");

    noResultOption.value = "";
    noResultOption.textContent =
      "일치하는 회원이 없습니다.";
    noResultOption.disabled = true;

    adminMemberSelect.append(noResultOption);
  } else {
    matchingOptions.forEach((option) => {
      adminMemberSelect.append(
        option.cloneNode(true)
      );
    });
  }

  adminMemberSelect.value = "";

  adminMemberSelect.dispatchEvent(
    new Event("change")
  );
});
// 관리자 화면 표시
async function showAdminApp() {
  loginScreen.hidden = true;
  appScreen.hidden = true;
  adminScreen.hidden = false;

  adminRoutineEditor.hidden = true;
  adminMemberInfo.textContent = "루틴을 관리할 회원을 선택해 주세요.";
  adminMemberSearch.value = "";

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
adminMemberSelect.addEventListener("change", async function () {
  const selectedOption =
    adminMemberSelect.options[adminMemberSelect.selectedIndex];

  // 다른 회원의 입력 내용이 남지 않도록 초기화
  adminRoutineName.value = "";
  adminRoutineImage.value = "";
  adminRoutineDescription.value = "";
  adminRoutinePreview.hidden = true;
  adminRoutinePreview.removeAttribute("src");
  adminSaveMessage.textContent = "";

  if (!adminMemberSelect.value) {
    adminRoutineEditor.hidden = true;
    adminMemberInfo.textContent =
      "루틴을 관리할 회원을 선택해 주세요.";
    return;
  }

  adminRoutineEditor.hidden = false;

  const memberName =
    selectedOption.dataset.memberName || "이름 없음";

  const email = selectedOption.dataset.email || "";
  const emailText = email ? ` (${email})` : "";

  const assignmentCount =
    selectedOption.dataset.assignmentCount || "0";

  const currentRoutineName =
    selectedOption.dataset.currentRoutineName || "";

  adminMemberInfo.textContent = currentRoutineName
    ? `${memberName}${emailText} · 총 ${assignmentCount}회 배정 · 현재 루틴: ${currentRoutineName}`
    : `${memberName}${emailText} · 총 ${assignmentCount}회 배정 · 현재 루틴 없음`;
  const currentRoutineImagePath =
    selectedOption.dataset.currentRoutineImagePath || "";

  if (currentRoutineImagePath) {
    const {
      data: signedImageData,
      error: signedImageError
    } = await supabaseClient.storage
      .from("routine-images")
      .createSignedUrl(currentRoutineImagePath, 3600);

    // 이미지를 불러오는 동안 다른 회원을 선택한 경우 중단
    if (adminMemberSelect.value !== selectedOption.value) {
      return;
    }

    if (signedImageError) {
      console.error(
        "현재 루틴 이미지 불러오기 실패:",
        signedImageError
      );
      return;
    }

    adminRoutinePreview.src = signedImageData.signedUrl;
    adminRoutinePreview.hidden = false;
  }
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

  try {
    adminSaveMessage.textContent =
      "루틴 이미지를 저장 중입니다...";

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

      // 데이터 저장에 실패했으므로 방금 업로드한 이미지를 삭제
      const { error: cleanupError } = await supabaseClient.storage
        .from("routine-images")
        .remove([imagePath]);

      if (cleanupError) {
        console.error(
          "저장 실패 이미지 정리 실패:",
          cleanupError
        );
      }

      adminSaveMessage.textContent =
        "루틴 정보를 저장하지 못했습니다.";

      saveAdminRoutineButton.disabled = false;
      return;
    }



    adminRoutineImage.value = "";
    adminRoutineDescription.value = "";
    adminMemberSearch.value = "";

    // 저장된 최신 정보를 다시 불러오기
    await loadAdminMembers();

    // 방금 루틴을 저장한 회원을 다시 선택
    adminMemberSelect.value = userId;

    adminMemberSelect.dispatchEvent(
      new Event("change")
    );

    adminSaveMessage.textContent =
      "저장했습니다. 최신 루틴 정보로 갱신되었습니다.";

  } catch (unexpectedError) {
    console.error(
      "루틴 저장 중 예상하지 못한 오류:",
      unexpectedError
    );

    adminSaveMessage.textContent =
      "작업 중 오류가 발생했습니다. " +
      "화면을 새로고침하여 저장 결과를 확인해 주세요.";

  } finally {
    saveAdminRoutineButton.disabled = false;
  }
});
// 로그인 버튼 기능
loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  loginMessage.textContent = "로그인 중...";
  loginButton.disabled = true;

  try {
    const { error } =
      await supabaseClient.auth.signInWithPassword({
        email: loginEmail.value.trim(),
        password: loginPassword.value
      });

    if (error) {
      loginMessage.textContent =
        "이메일 또는 비밀번호를 확인해 주세요.";
      return;
    }

    loginMessage.textContent = "";
    loginForm.reset();

    await showScreenForCurrentUser();

  } catch (unexpectedError) {
    console.error(
      "로그인 중 예상하지 못한 오류:",
      unexpectedError
    );

    loginMessage.textContent =
      "네트워크 연결을 확인하고 다시 시도해 주세요.";

  } finally {
    loginButton.disabled = false;
  }
});

// 이미 로그인한 상태인지 확인
async function initializeLogin() {
  try {
    const {
      data: { session },
      error: sessionError
    } = await supabaseClient.auth.getSession();

    if (sessionError) {
      console.error(
        "로그인 상태 확인 실패:",
        sessionError
      );

      loginMessage.textContent =
        "로그인 상태를 확인하지 못했습니다. " +
        "잠시 후 다시 시도해 주세요.";

      return;
    }

    if (session) {
      await showScreenForCurrentUser();
    }

  } catch (unexpectedError) {
    console.error(
      "로그인 상태 확인 중 예상하지 못한 오류:",
      unexpectedError
    );

    loginMessage.textContent =
      "네트워크 연결을 확인해 주세요.";
  }
}

// 로그아웃 공통 기능
async function handleLogout() {
  logoutButton.disabled = true;
  adminLogoutButton.disabled = true;

  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      alert("로그아웃하지 못했습니다. 다시 시도해 주세요.");
      return;
    }

    // 회원·관리자 화면을 숨기고 로그인 화면 표시
    appScreen.hidden = true;
    adminScreen.hidden = true;
    loginScreen.hidden = false;

    // 회원가입 화면이 열려 있었다면 기본 로그인 화면으로 복구
    signupForm.hidden = true;
    loginForm.hidden = false;
    showSignupButton.hidden = false;

    // 입력값과 안내 메시지 초기화
    loginForm.reset();
    signupForm.reset();
    loginMessage.textContent = "";
    signupMessage.textContent = "";

    // 버튼 상태 초기화
    loginButton.disabled = false;
    signupButton.disabled = false;

    // 관리자 화면 상태 초기화
    adminMemberSearch.value = "";
    adminMemberSelect.innerHTML =
      '<option value="">루틴을 관리할 회원을 선택하세요.</option>';

    adminMemberOptionCache = [];
    adminRoutineEditor.hidden = true;

    adminMemberInfo.textContent =
      "루틴을 관리할 회원을 선택해 주세요.";

    adminRoutineName.value = "";
    adminRoutineImage.value = "";
    adminRoutineDescription.value = "";

    adminRoutinePreview.hidden = true;
    adminRoutinePreview.removeAttribute("src");

    adminSaveMessage.textContent = "";
    saveAdminRoutineButton.disabled = false;

    // 비밀번호 입력창과 눈 버튼 초기화
    document
      .querySelectorAll("[data-password-toggle]")
      .forEach((button) => {
        const passwordInput = document.querySelector(
          `#${button.dataset.passwordToggle}`
        );

        if (passwordInput) {
          passwordInput.type = "password";
        }

        button.textContent = "👁";
        button.setAttribute("aria-label", "비밀번호 보기");
        button.setAttribute("aria-pressed", "false");
      });

  } catch (unexpectedError) {
    console.error(
      "로그아웃 중 예상하지 못한 오류:",
      unexpectedError
    );

    alert("네트워크 연결을 확인하고 다시 시도해 주세요.");

  } finally {
    logoutButton.disabled = false;
    adminLogoutButton.disabled = false;
  }
}

logoutButton.addEventListener("click", handleLogout);
adminLogoutButton.addEventListener("click", handleLogout);
toggleRoutineDescriptionButton.addEventListener("click", function () {
  const isExpanded = routineDescription.classList.toggle("is-expanded");

  toggleRoutineDescriptionButton.textContent = isExpanded
    ? "설명 접기"
    : "설명 더 보기";

  toggleRoutineDescriptionButton.setAttribute(
    "aria-expanded",
    String(isExpanded)
  );
});
function showSignupForm() {
  loginForm.hidden = true;
  showSignupButton.hidden = true;
  signupForm.hidden = false;

  loginMessage.textContent = "";
  signupMessage.textContent = "";
  signupForm.reset();
  signupEmail.focus();
}

function showLoginForm() {
  signupForm.hidden = true;
  loginForm.hidden = false;
  showSignupButton.hidden = false;

  signupMessage.textContent = "";
  signupForm.reset();
}

showSignupButton.addEventListener("click", showSignupForm);

hideSignupButton.addEventListener("click", showLoginForm);

signupForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = signupName.value.trim();
  const phoneLast4 = signupPhoneLast4.value.trim();

  if (!name) {
    signupMessage.textContent = "이름을 입력해 주세요.";
    signupName.focus();
    return;
  }

  if (!/^\d{4}$/.test(phoneLast4)) {
    signupMessage.textContent =
      "전화번호 뒷 4자리를 숫자로 입력해 주세요.";
    signupPhoneLast4.focus();
    return;
  }

  if (signupPassword.value !== signupPasswordConfirm.value) {
    signupMessage.textContent = "비밀번호가 서로 다릅니다.";
    return;
  }

  signupMessage.textContent = "회원가입 중...";
  signupButton.disabled = true;

  try {
    const { data, error } =
      await supabaseClient.auth.signUp({
        email: signupEmail.value.trim(),
        password: signupPassword.value,
        options: {
          data: {
            display_name: name,
            phone_last4: phoneLast4
          }
        }
      });

    if (error) {
      signupMessage.textContent =
        error.message === "User already registered"
          ? "이미 가입된 이메일입니다."
          : "회원가입하지 못했습니다. 다시 시도해 주세요.";

      return;
    }

    if (!data.session) {
      signupMessage.textContent =
        "회원가입은 완료됐습니다. " +
        "이메일 인증 설정을 다시 확인해 주세요.";

      return;
    }

    signupForm.reset();

    await initializeLogin();

  } catch (unexpectedError) {
    console.error(
      "회원가입 중 예상하지 못한 오류:",
      unexpectedError
    );

    signupMessage.textContent =
      "네트워크 연결을 확인하고 다시 시도해 주세요.";

  } finally {
    signupButton.disabled = false;
  }
});
document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", function () {
    const passwordInput = document.querySelector(
      `#${button.dataset.passwordToggle}`
    );

    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";
    button.textContent = isHidden ? "🙈" : "👁";
    button.setAttribute(
      "aria-label",
      isHidden ? "비밀번호 숨기기" : "비밀번호 보기"
    );
    button.setAttribute("aria-pressed", String(isHidden));
  });
});
initializeLogin();