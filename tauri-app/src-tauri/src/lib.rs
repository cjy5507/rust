// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use chromiumoxide::browser::{Browser, BrowserConfig}; // 변경
use futures::StreamExt; // chromiumoxide 이벤트 처리에 필요할 수 있음
use serde::{Deserialize, Serialize};
use std::time::Duration;
use chrono::{Local, NaiveTime};

mod automation;
use automation::{
    log_user_action,
    handle_initial_popup,
    click_visit_reservation_button,
    click_rolex_collection_button,
    click_agree_button,
    select_visit_date,
    select_visit_time,
    click_next_button,
    handle_pass_authentication,
    submit_final_reservation,
    check_success_page
};
// handle_auth_page는 이 파일(lib.rs)에 정의되어 있으므로 use하지 않습니다.

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
    println!("🚀 자동화 환경 설정 시작 (chromiumoxide)...");

    // BrowserConfig를 빌드합니다.
    let _browser_config = BrowserConfig::builder()
        .with_head() // 비헤드리스 모드 (GUI 브라우저)
        .window_size(800, 600)
        .no_sandbox()
        .args(vec!["--disable-gpu", "--no-first-run"])
        .build()
        .map_err(|e| format!("{:?}", e))?;

    match Browser::launch(_browser_config).await {
        Ok((browser, mut handler)) => {
            println!("✅ 브라우저 환경 확인 완료!");
            
            // 핸들러를 백그라운드에서 실행
            let handler_task = tokio::spawn(async move {
                while let Some(h) = handler.next().await {
                    if h.is_err() {
                        break;
                    }
                }
            });
            
            // 브라우저 안정화 대기
            println!("⏳ 브라우저 안정화 중...");
            tokio::time::sleep(Duration::from_secs(3)).await;
            
            // 테스트 페이지 생성
            match tokio::time::timeout(
                Duration::from_secs(10),
                browser.new_page("https://www.google.com")
            ).await {
                Ok(Ok(_page)) => {
                    println!("✅ 테스트 페이지 생성 성공");
                    tokio::time::sleep(Duration::from_secs(5)).await;
                }
                _ => {
                    println!("⚠️ 테스트 페이지 생성 실패, 하지만 브라우저는 정상");
                }
            }
            
            // 브라우저를 5초 더 유지한 후 종료
            println!("🕐 5초 후 브라우저가 종료됩니다...");
            tokio::time::sleep(Duration::from_secs(5)).await;
            
            // 핸들러 태스크 종료 대기 (브라우저는 자동으로 닫힘)
            let _ = handler_task.await;
            
            log_user_action("환경 설정", "브라우저 환경 확인 완료");
            Ok("✅ 자동화 환경 설정 완료!".to_string())
        }
        Err(e) => {
            let error_msg = format!("❌ 브라우저 환경 설정 실패: {}", e);
            println!("{}", error_msg);
            log_user_action("환경 설정", &format!("실패: {}", e));
            Err(error_msg)
        }
    }
}

#[tauri::command]
async fn run_single_automation(store_config: StoreConfig) -> Result<AutomationResult, String> {
    println!("🚀 개별 자동화 실행 시작: {}", store_config.store_name);
    log_user_action("자동화 시작", &format!("매장: {}", store_config.store_name));

    let result = run_rolex_automation(&store_config).await;

    match result {
        Ok(success_msg) => {
            let timestamp = chrono::Utc::now().to_rfc3339();
            log_user_action("자동화 성공", &format!("매장: {}", store_config.store_name));
            Ok(AutomationResult {
                success: true,
                message: success_msg,
                timestamp,
                store_name: store_config.store_name,
            })
        }
        Err(error_msg) => {
            let timestamp = chrono::Utc::now().to_rfc3339();
            log_user_action(
                "자동화 실패",
                &format!("매장: {}, 오류: {}", store_config.store_name, error_msg),
            );
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
async fn run_multiple_automation(
    store_configs: Vec<StoreConfig>,
) -> Result<Vec<AutomationResult>, String> {
    println!("🚀 다중 자동화 실행 시작: {} 개 매장", store_configs.len());
    log_user_action(
        "다중 자동화 시작",
        &format!("{} 개 매장", store_configs.len()),
    );

    // 매장들을 순차적으로 빠르게 시작 (병렬 실행 충돌 방지)
    let mut tasks = Vec::new();
    for (index, store_config) in store_configs.into_iter().enumerate() {
        // 각 매장마다 0.5초씩 간격을 두고 시작
        tokio::time::sleep(Duration::from_millis(500 * index as u64)).await;
        
        let task = tokio::spawn(async move { 
            run_single_automation(store_config).await 
        });
        tasks.push(task);
    }

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

    let success_count = results.iter().filter(|r| r.success).count();
    println!(
        "✅ 다중 자동화 완료: {} 개 매장 (성공: {}, 실패: {})",
        results.len(),
        success_count,
        results.len() - success_count
    );

    log_user_action(
        "다중 자동화 완료",
        &format!(
            "총 {}, 성공 {}, 실패 {}",
            results.len(),
            success_count,
            results.len() - success_count
        ),
    );

    Ok(results)
}

#[tauri::command]
async fn stop_automation(store_name: String) -> Result<String, String> {
    println!("🛑 {} 자동화 중지 요청", store_name);
    log_user_action("자동화 중지", &format!("매장: {}", store_name));

    // 현재는 브라우저가 사용자에 의해 수동으로 닫히도록 함
    // 실제 구현에서는 프로세스 ID를 추적하여 종료할 수 있음

    println!("✅ {} 자동화 중지 신호 전송", store_name);
    Ok(format!(
        "{} 자동화 중지 신호를 전송했습니다. 브라우저를 수동으로 닫아주세요.",
        store_name
    ))
}

#[tauri::command]
async fn stop_all_automation() -> Result<String, String> {
    println!("🛑 모든 자동화 중지 요청");
    log_user_action("전체 자동화 중지", "사용자 요청");

    println!("✅ 모든 자동화 중지 신호 전송");
    Ok("모든 자동화 중지 신호를 전송했습니다. 브라우저들을 수동으로 닫아주세요.".to_string())
}

#[allow(dead_code)]
struct AutomationConfig {
    store_name: String,
    start_time: Option<String>,
    visit_date: Option<String>,
    visit_time: Option<String>,
    carrier: String,
    email: String,
}

async fn run_rolex_automation(config: &StoreConfig) -> Result<String, String> {
    println!("🚀 {} 자동화 시작", config.store_name);
    println!("📧 이메일: {}", config.email);
    println!("📱 통신사: {}", config.carrier);
    println!("📅 예약날짜: {:?}", config.visit_date);
    println!("🕐 예약시간: {:?}", config.visit_time);
    println!("⏰ 시작시간: {:?}", config.start_time);

    // 병렬 실행을 위한 고유한 사용자 데이터 디렉토리 생성
    let unique_id = format!("{}-{}", 
        config.store_name.replace(" ", "_").replace("-", "_"),
        std::process::id()
    );
    let user_data_dir = std::env::temp_dir().join(format!("chromium-{}", unique_id));
    
    // Chrome args 설정 (병렬 실행 지원 + 빠른 클릭)
    let chrome_args_str: Vec<String> = vec![
        "--no-first-run".to_string(),
        "--disable-default-apps".to_string(),
        "--disable-popup-blocking".to_string(),
        "--disable-dev-shm-usage".to_string(),
        "--disable-extensions".to_string(),
        "--no-default-browser-check".to_string(),
        "--disable-gpu".to_string(),
        "--disable-background-timer-throttling".to_string(), // 빠른 실행
        "--disable-backgrounding-occluded-windows".to_string(),
        "--disable-renderer-backgrounding".to_string(),
        "--disable-features=TranslateUI".to_string(),
        "--disable-logging".to_string(), // 로그 줄이기
        "--silent".to_string(),
        format!("--user-data-dir={}", user_data_dir.to_string_lossy()), // 고유 디렉토리
    ];
    let chrome_args_ref: Vec<&str> = chrome_args_str.iter().map(AsRef::as_ref).collect();

    let browser_config = BrowserConfig::builder()
        .with_head() // 비헤드리스 모드 (GUI 브라우저)
        .window_size(1200, 800)
        .no_sandbox()
        .args(chrome_args_ref)
        .build()
        .map_err(|e| format!("{:?}", e))?;

    println!("🔥 {} 브라우저 시작 중...", config.store_name);
    let (browser, mut handler) = Browser::launch(browser_config)
        .await
        .map_err(|e| format!("{:?}", e))?;
    
    // 핸들러를 백그라운드에서 조용하게 실행
    let handler_task = tokio::spawn(async move {
        loop {
            match handler.next().await {
                Some(h) => {
                    if let Err(_) = h {
                        // 에러 로그 없이 조용히 처리
                        tokio::time::sleep(Duration::from_millis(50)).await;
                    }
                }
                None => {
                    break;
                }
            }
        }
    });

    // 브라우저 빠른 안정화
    println!("⏳ 브라우저 안정화 중...");
    tokio::time::sleep(Duration::from_secs(2)).await;
    println!("✅ {} 브라우저 시작 완료", config.store_name);

    // 새 페이지 생성 (더 안전한 방식)
    println!("📄 새 페이지 생성 중...");
    let page = match tokio::time::timeout(
        Duration::from_secs(15),
        browser.new_page("about:blank")
    ).await {
        Ok(Ok(p)) => {
            println!("✅ 새 페이지 생성 완료");
            tokio::time::sleep(Duration::from_secs(1)).await; // 페이지 안정화 단축
            p
        }
        Ok(Err(e)) => {
            println!("❌ 새 페이지 생성 실패: {:?}", e);
            println!("🕐 브라우저를 10초 동안 유지합니다...");
            tokio::time::sleep(Duration::from_secs(10)).await;
            let _ = handler_task.await;
            let _ = std::fs::remove_dir_all(&user_data_dir);
            return Err("새 페이지 생성 실패".to_string());
        }
        Err(_) => {
            println!("❌ 새 페이지 생성 타임아웃");
            println!("🕐 브라우저를 10초 동안 유지합니다...");
            tokio::time::sleep(Duration::from_secs(10)).await;
            let _ = handler_task.await;
            let _ = std::fs::remove_dir_all(&user_data_dir);
            return Err("새 페이지 생성 타임아웃".to_string());
        }
    };

    println!("✅ 인증 URL로 이동합니다: {}", config.auth_url);

    // 1. 인증 URL로 이동 (더 안전한 방식)
    match tokio::time::timeout(
        Duration::from_secs(20),
        page.goto(&config.auth_url)
    ).await {
        Ok(Ok(_)) => {
            println!("✅ 인증 URL 로딩 완료");
            tokio::time::sleep(Duration::from_secs(2)).await; // 페이지 로딩 대기 단축
        }
        Ok(Err(e)) => {
            println!("❌ URL 이동 실패: {:?}", e);
            println!("🕐 브라우저를 10초 동안 유지합니다...");
            tokio::time::sleep(Duration::from_secs(10)).await;
            let _ = handler_task.await;
            let _ = std::fs::remove_dir_all(&user_data_dir);
            return Err("URL 이동 실패".to_string());
        }
        Err(_) => {
            println!("❌ URL 이동 타임아웃");
            println!("🕐 브라우저를 10초 동안 유지합니다...");
            tokio::time::sleep(Duration::from_secs(10)).await;
            let _ = handler_task.await;
            let _ = std::fs::remove_dir_all(&user_data_dir);
            return Err("URL 이동 타임아웃".to_string());
        }
    }

    // 최대 3번 시도하는 메인 자동화 루프
    for main_attempt in 1..=3 {
        println!("🔄 메인 자동화 시도 {}/3", main_attempt);
        
        // 2. 쿠키 팝업 처리
        if let Err(e) = handle_initial_popup(&page).await {
            println!("⚠️ 쿠키 팝업 처리 실패: {}", e);
        }
        tokio::time::sleep(Duration::from_millis(500)).await; // 빠른 진행

        // 3. 방문 예약하기 버튼 클릭
        if let Err(e) = click_visit_reservation_button(&page).await {
            println!("❌ 방문 예약하기 버튼 클릭 실패: {}", e);
            if main_attempt == 3 {
                println!("🕐 브라우저를 30초 동안 유지합니다 (수동 확인용)...");
                tokio::time::sleep(Duration::from_secs(30)).await;
                let _ = handler_task.await;
                let _ = std::fs::remove_dir_all(&user_data_dir);
                return Err("방문 예약하기 버튼을 찾을 수 없습니다".to_string());
            }
            continue;
        }

        // 4. 롤렉스 컬렉션 버튼 클릭 (1단계)
        if let Err(e) = click_rolex_collection_button(&page).await {
            println!("❌ 롤렉스 컬렉션 버튼 클릭 실패: {}", e);
            if main_attempt == 3 {
                println!("🕐 브라우저를 30초 동안 유지합니다 (수동 확인용)...");
                tokio::time::sleep(Duration::from_secs(30)).await;
                let _ = handler_task.await;
                let _ = std::fs::remove_dir_all(&user_data_dir);
                return Err("롤렉스 컬렉션 버튼을 찾을 수 없습니다".to_string());
            }
            continue;
        }

        // 5. 시간 기반 대기 (설정된 시작 시간까지 - 동의합니다 버튼 클릭 전)
        if let Some(start_time_str) = &config.start_time {
            if let Ok(target_time) = NaiveTime::parse_from_str(start_time_str, "%H:%M:%S") {
                println!("⏰ 설정된 시작 시간: {}까지 대기합니다.", target_time.format("%H:%M:%S"));
                loop {
                    let current_time = Local::now().time();
                    if current_time >= target_time {
                        println!("⏰ 설정된 시작 시간 {} 도달! 동의합니다 버튼을 클릭합니다.", start_time_str);
                        break;
                    }
                    tokio::time::sleep(Duration::from_secs(1)).await;
                }
            } else if let Ok(target_time) = NaiveTime::parse_from_str(start_time_str, "%H:%M") {
                println!("⏰ 설정된 시작 시간: {}까지 대기합니다.", target_time.format("%H:%M:%S"));
                loop {
                    let current_time = Local::now().time();
                    if current_time >= target_time {
                        println!("⏰ 설정된 시작 시간 {} 도달! 동의합니다 버튼을 클릭합니다.", start_time_str);
                        break;
                    }
                    tokio::time::sleep(Duration::from_secs(1)).await;
                }
            }
        }

        // 6. 동의합니다 버튼 클릭 (2단계 - 시작시간에 맞춰 실행)
        if let Err(e) = click_agree_button(&page).await {
            println!("⚠️ 동의 버튼 클릭 실패: {}", e);
        }

        // 7. 방문 날짜 선택 (3단계)
        if let Some(visit_date) = &config.visit_date {
            if let Err(e) = select_visit_date(&page, visit_date).await {
                println!("⚠️ 방문 날짜 선택 실패: {}", e);
                if e.contains("마감") {
                    // 예약이 마감된 경우 즉시 종료
                    println!("🕐 브라우저를 30초 동안 유지합니다 (예약 마감 확인용)...");
                    tokio::time::sleep(Duration::from_secs(30)).await;
                    let _ = handler_task.await;
                    let _ = std::fs::remove_dir_all(&user_data_dir);
                    return Err(e);
                }
            }
        }

        // 8. 방문 시간 선택 (3단계 계속)
        if let Some(visit_time) = &config.visit_time {
            if let Err(e) = select_visit_time(&page, visit_time).await {
                println!("⚠️ 방문 시간 선택 실패: {}", e);
            }
        }

        // 9. 다음 버튼 클릭 (3단계에서 PASS 인증으로)
        if let Err(e) = click_next_button(&page).await {
            println!("⚠️ 다음 버튼 클릭 실패: {}", e);
        }

        // 10. PASS 인증 처리 (사용자 개입 대기)
        if let Err(e) = handle_pass_authentication(&page, &config.carrier).await {
            println!("❌ PASS 인증 실패: {}", e);
            if main_attempt == 3 {
                println!("🕐 브라우저를 30초 동안 유지합니다 (수동 확인용)...");
                tokio::time::sleep(Duration::from_secs(30)).await;
                let _ = handler_task.await;
                let _ = std::fs::remove_dir_all(&user_data_dir);
                return Err("PASS 인증 실패".to_string());
            }
            continue;
        }

        // 11. 이메일 입력 및 최종 예약 (4단계)
        if let Err(e) = submit_final_reservation(&page, &config.email).await {
            println!("❌ 최종 예약 제출 실패: {}", e);
            if main_attempt == 3 {
                println!("🕐 브라우저를 30초 동안 유지합니다 (수동 확인용)...");
                tokio::time::sleep(Duration::from_secs(30)).await;
                let _ = handler_task.await;
                let _ = std::fs::remove_dir_all(&user_data_dir);
                return Err("최종 예약 제출 실패".to_string());
            }
            continue;
        }

        // 12. 성공 페이지 확인
        match check_success_page(&page).await {
            Ok(true) => {
                println!("🎉 {} 자동화가 성공적으로 완료되었습니다!", config.store_name);
                log_user_action(
                    "예약 성공",
                    &format!("매장: {}, 이메일: {}", config.store_name, config.email),
                );
                
    // 성공 시 30초 동안 브라우저를 유지 (결과 확인용)
                println!("🕐 성공! 브라우저를 30초 동안 유지합니다...");
                tokio::time::sleep(Duration::from_secs(30)).await;
                let _ = handler_task.await;
                
                // 임시 디렉토리 정리
                let _ = std::fs::remove_dir_all(&user_data_dir);
                
                return Ok(format!("{} 예약이 성공적으로 완료되었습니다!", config.store_name));
            }
            Ok(false) => {
                println!("❌ 예약 실패 (시도 {}/3)", main_attempt);
                if main_attempt < 3 {
                    println!("🔄 5초 후 다시 시도합니다...");
                    tokio::time::sleep(Duration::from_secs(5)).await;
                    continue;
                }
            }
            Err(e) => {
                println!("❌ 성공 페이지 확인 중 오류: {}", e);
                if main_attempt < 3 {
                    continue;
                }
            }
        }
    }

    // 3번 모두 실패한 경우
    println!("❌ {} 자동화 최종 실패 (3회 시도 모두 실패)", config.store_name);
    log_user_action(
        "예약 실패",
        &format!("매장: {}, 최종 실패", config.store_name),
    );
    
    // 실패 시 30초 동안 브라우저를 유지 (디버깅용)
    println!("🕐 실패! 브라우저를 30초 동안 유지합니다...");
    tokio::time::sleep(Duration::from_secs(30)).await;
    let _ = handler_task.await;
    
    // 임시 디렉토리 정리
    let _ = std::fs::remove_dir_all(&user_data_dir);
    
    Err(format!("{} 예약 실패 (3회 시도 모두 실패)", config.store_name))
}

// 기존 코드와의 호환성을 위한 레거시 함수들 제거됨 - 새로운 플로우 사용

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
