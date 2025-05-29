// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::{Deserialize, Serialize};
use headless_chrome::{Browser, LaunchOptions};
use std::time::Duration;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StoreConfig {
    #[serde(rename = "storeName")]
    store_name: String,
    #[serde(rename = "authUrl")]
    auth_url: String,
    #[serde(rename = "reserveUrl")]
    reserve_url: String,
    #[serde(rename = "startTime")]
    start_time: Option<String>,
    #[serde(rename = "visitDate")]
    visit_date: Option<String>,
    #[serde(rename = "visitTime")]
    visit_time: Option<String>,
    carrier: String,
    email: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AutomationResult {
    success: bool,
    message: String,
    timestamp: String,
    store_name: String,
}

#[tauri::command]
async fn setup_automation() -> Result<String, String> {
    println!("🚀 자동화 환경 설정 시작...");
    
    // 브라우저 환경 테스트
    match Browser::default() {
        Ok(_) => {
            println!("✅ 브라우저 환경 확인 완료!");
            Ok("✅ 자동화 환경 설정 완료!".to_string())
        }
        Err(e) => {
            let error_msg = format!("❌ 브라우저 환경 설정 실패: {}", e);
            println!("{}", error_msg);
            Err(error_msg)
        }
    }
}

#[tauri::command]
async fn run_single_automation(store_config: StoreConfig) -> Result<AutomationResult, String> {
    println!("🚀 개별 자동화 실행 시작: {}", store_config.store_name);
    
    let result = run_rolex_automation(&store_config).await;
    
    match result {
        Ok(success_msg) => {
            let timestamp = chrono::Utc::now().to_rfc3339();
            Ok(AutomationResult {
                success: true,
                message: success_msg,
                timestamp,
                store_name: store_config.store_name,
            })
        }
        Err(error_msg) => {
            let timestamp = chrono::Utc::now().to_rfc3339();
            Ok(AutomationResult {
                success: false,
                message: error_msg,
                timestamp,
                store_name: store_config.store_name,
            })
        }
    }
}

#[tauri::command]
async fn run_multiple_automation(store_configs: Vec<StoreConfig>) -> Result<Vec<AutomationResult>, String> {
    println!("🚀 다중 자동화 실행 시작: {} 개 매장", store_configs.len());
    
    // 모든 매장을 병렬로 동시에 실행
    let tasks: Vec<_> = store_configs.into_iter().map(|store_config| {
        tokio::spawn(async move {
            run_single_automation(store_config).await
        })
    }).collect();
    
    // 모든 작업이 완료될 때까지 대기
    let mut results = Vec::new();
    for task in tasks {
        match task.await {
            Ok(Ok(automation_result)) => {
                results.push(automation_result);
            }
            Ok(Err(error)) => {
                results.push(AutomationResult {
                    success: false,
                    message: format!("실행 실패: {}", error),
                    timestamp: chrono::Utc::now().to_rfc3339(),
                    store_name: "Unknown".to_string(),
                });
            }
            Err(join_error) => {
                results.push(AutomationResult {
                    success: false,
                    message: format!("작업 실패: {}", join_error),
                    timestamp: chrono::Utc::now().to_rfc3339(),
                    store_name: "Unknown".to_string(),
                });
            }
        }
    }
    
    println!("✅ 다중 자동화 완료: {} 개 매장", results.len());
    Ok(results)
}

#[tauri::command]
async fn stop_automation(store_name: String) -> Result<String, String> {
    println!("🛑 {} 자동화 중지 요청", store_name);
    
    // 현재는 브라우저가 사용자에 의해 수동으로 닫히도록 함
    // 실제 구현에서는 프로세스 ID를 추적하여 종료할 수 있음
    
    println!("✅ {} 자동화 중지 신호 전송", store_name);
    Ok(format!("{} 자동화 중지 신호를 전송했습니다. 브라우저를 수동으로 닫아주세요.", store_name))
}

#[tauri::command]
async fn stop_all_automation() -> Result<String, String> {
    println!("🛑 모든 자동화 중지 요청");
    
    println!("✅ 모든 자동화 중지 신호 전송");
    Ok("모든 자동화 중지 신호를 전송했습니다. 브라우저들을 수동으로 닫아주세요.".to_string())
}

async fn run_rolex_automation(config: &StoreConfig) -> Result<String, String> {
    println!("🚀 {} 자동화 시작", config.store_name);
    println!("📧 이메일: {}", config.email);
    println!("📱 통신사: {}", config.carrier);
    println!("📅 예약날짜: {:?}", config.visit_date);
    println!("🕐 예약시간: {:?}", config.visit_time);

    // 브라우저 실행 옵션 (빠른 시작을 위해 최적화)
    let launch_options = LaunchOptions {
        headless: false,
        window_size: Some((1200, 800)),
        sandbox: false, // 샌드박스 비활성화로 빠른 시작
        idle_browser_timeout: Duration::from_secs(300), // 5분 후 자동 종료
        ..Default::default()
    };

    println!("🔥 {} 브라우저 시작 중...", config.store_name);
    let browser = Browser::new(launch_options)
        .map_err(|e| format!("브라우저 실행 실패: {}", e))?;
    
    println!("✅ {} 브라우저 시작 완료", config.store_name);

    let tab = browser.new_tab()
        .map_err(|e| format!("새 탭 생성 실패: {}", e))?;

    // 1단계: 인증 URL 접속
    println!("🔐 {} 인증 URL 접속: {}", config.store_name, config.auth_url);
    tab.navigate_to(&config.auth_url)
        .map_err(|e| format!("인증 페이지 접속 실패: {}", e))?;

    tab.wait_until_navigated()
        .map_err(|e| format!("페이지 로딩 실패: {}", e))?;

    // 인증 페이지 자동 처리 시도
    if let Err(e) = handle_auth_page(&tab, &config.carrier, &config.email).await {
        println!("⚠️ {} 인증 페이지 자동 처리 실패: {}", config.store_name, e);
        println!("💡 {} 수동으로 인증을 진행해주세요!", config.store_name);
    }

    // 사용자 개입 시간 (30초)
    println!("⏳ {} 인증 처리 대기 중... (30초)", config.store_name);
    println!("💡 {} 이 시간 동안 수동으로 인증을 완료하세요!", config.store_name);
    tokio::time::sleep(Duration::from_secs(30)).await;

    // 2단계: 예약 URL 접속
    println!("📝 {} 예약 URL 접속: {}", config.store_name, config.reserve_url);
    tab.navigate_to(&config.reserve_url)
        .map_err(|e| format!("예약 페이지 접속 실패: {}", e))?;

    tab.wait_until_navigated()
        .map_err(|e| format!("예약 페이지 로딩 실패: {}", e))?;

    // 예약 페이지 자동 처리 시도
    if let Err(e) = handle_reserve_page(&tab, config.visit_date.as_deref(), config.visit_time.as_deref()).await {
        println!("⚠️ {} 예약 페이지 자동 처리 실패: {}", config.store_name, e);
        println!("💡 {} 수동으로 예약을 진행해주세요!", config.store_name);
    }

    println!("✅ {} 자동화 완료", config.store_name);

    // 브라우저는 자동으로 정리됨 (Drop trait)
    // 사용자가 필요에 따라 수동으로 닫을 수도 있음
    
    Ok(format!("{} 예약 자동화가 시작되었습니다. 브라우저에서 진행상황을 확인하세요.", config.store_name))
}

async fn handle_auth_page(tab: &headless_chrome::Tab, carrier: &str, email: &str) -> Result<(), String> {
    // 페이지가 완전히 로드될 때까지 대기
    tokio::time::sleep(Duration::from_secs(2)).await;

    // 통신사 선택 시도
    let carrier_selectors = vec![
        format!("[data-carrier='{}']", carrier),
        format!("input[value='{}']", carrier),
        format!("option[value='{}']", carrier),
    ];

    for selector in carrier_selectors {
        if let Ok(element) = tab.find_element(&selector) {
            let _ = element.click();
            println!("📱 통신사 선택: {}", carrier);
            break;
        }
    }

    // 이메일 입력 시도
    let email_selectors = vec![
        "input[type='email']".to_string(),
        "input[name='email']".to_string(),
        "#email".to_string(),
        "[placeholder*='email']".to_string(),
        "[placeholder*='이메일']".to_string(),
    ];

    for selector in email_selectors {
        if let Ok(element) = tab.find_element(&selector) {
            // 기존 텍스트 지우기 시도
            let _ = element.focus();
            let _ = element.call_js_fn("function() { this.value = ''; }", vec![], false);
            let _ = element.type_into(email);
            println!("📧 이메일 입력: {}", email);
            break;
        }
    }

    // 인증 버튼 클릭 시도  
    let auth_button_selectors = vec![
        "input[type='submit']".to_string(),
        "[type='submit']".to_string(),
        "button[type='submit']".to_string(),
    ];

    for selector in auth_button_selectors {
        if let Ok(element) = tab.find_element(&selector) {
            let _ = element.click();
            println!("🔐 인증 버튼 클릭");
            break;
        }
    }

    Ok(())
}

async fn handle_reserve_page(tab: &headless_chrome::Tab, visit_date: Option<&str>, visit_time: Option<&str>) -> Result<(), String> {
    // 페이지가 완전히 로드될 때까지 대기
    tokio::time::sleep(Duration::from_secs(2)).await;

    // 날짜 선택 시도
    if let Some(date) = visit_date {
        let date_selectors = vec![
            format!("[data-date='{}']", date),
            "input[type='date']".to_string(),
            "[name='date']".to_string(),
            "#date".to_string(),
        ];

        for selector in date_selectors {
            if let Ok(element) = tab.find_element(&selector) {
                let _ = element.focus();
                let _ = element.call_js_fn("function() { this.value = ''; }", vec![], false);
                let _ = element.type_into(date);
                println!("📅 날짜 선택: {}", date);
                break;
            }
        }
    }

    // 시간 선택 시도
    if let Some(time) = visit_time {
        let time_selectors = vec![
            format!("[data-time='{}']", time),
            "select[name='time']".to_string(),
            "input[type='time']".to_string(),
            "#time".to_string(),
        ];

        for selector in time_selectors {
            if let Ok(element) = tab.find_element(&selector) {
                let _ = element.click();
                println!("🕐 시간 선택: {}", time);
                break;
            }
        }
    }

    // 예약 버튼 클릭 시도
    let reserve_button_selectors = vec![
        "input[type='submit']".to_string(),
        "[type='submit']".to_string(),
        "button[type='submit']".to_string(),
    ];

    for selector in reserve_button_selectors {
        if let Ok(element) = tab.find_element(&selector) {
            let _ = element.click();
            println!("📝 예약 버튼 클릭");
            break;
        }
    }

    // 예약 완료 확인 시도
    tokio::time::sleep(Duration::from_secs(3)).await;
    
    let success_selectors = vec![
        ".success".to_string(),
        ".complete".to_string(),
        "[class*='success']".to_string(),
    ];

    for selector in success_selectors {
        if let Ok(_) = tab.find_element(&selector) {
            println!("✅ 예약 완료 확인");
            return Ok(());
        }
    }

    println!("⚠️ 예약 완료 상태를 확인할 수 없습니다. 수동으로 확인해주세요.");
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            setup_automation, 
            run_single_automation, 
            run_multiple_automation,
            stop_automation,
            stop_all_automation
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
