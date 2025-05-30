// 크로노디그마 예약 자동화 모듈 (개선된 버전)
use chromiumoxide::Page; 
use std::time::Duration; 

// 1. 쿠키 팝업 처리 함수 (정확한 셀렉터 사용)
pub async fn handle_initial_popup(page: &Page) -> Result<(), String> {
    println!("🍪 쿠키 팝업 처리 중...");
    tokio::time::sleep(Duration::from_secs(2)).await;

    for attempt in 0..3 {
        println!("🍪 쿠키 팝업 처리 시도 {}/3", attempt + 1);
        
        // 크로노디그마 전용 쿠키 수락 버튼 셀렉터
        let popup_click_js = r#"
            (() => {
                const acceptBtn = document.querySelector('.cookies__button--accept');
                if (acceptBtn && window.getComputedStyle(acceptBtn).display !== 'none') {
                    console.log('쿠키 수락 버튼 찾음');
                    acceptBtn.click();
                    return true;
                }
                return false;
            })()
        "#;

        match page.evaluate_expression(popup_click_js.to_string()).await {
            Ok(result) => {
                if let Ok(success) = result.into_value::<bool>() {
                    if success {
                        println!("✅ 쿠키 팝업 처리 완료");
                        tokio::time::sleep(Duration::from_secs(2)).await;
                        return Ok(());
                    }
                }
            }
            Err(_) => {}
        }
        
        tokio::time::sleep(Duration::from_secs(1)).await;
    }
    
    println!("ℹ️ 쿠키 팝업이 없거나 이미 처리됨");
    Ok(())
}

// 2. 방문 예약하기 버튼 클릭 (정확한 셀렉터)
pub async fn click_visit_reservation_button(page: &Page) -> Result<(), String> {
    println!("📅 방문 예약하기 버튼 찾는 중...");
    tokio::time::sleep(Duration::from_secs(2)).await;

    for attempt in 0..5 {
        println!("📅 방문 예약하기 버튼 클릭 시도 {}/5", attempt + 1);
        
        let reservation_click_js = r#"
            (() => {
                const reservationBtn = document.querySelector('a[href="https://www.chronodigmwatch.co.kr/rolex/contact-seoul/appointment/"]');
                if (reservationBtn && window.getComputedStyle(reservationBtn).display !== 'none') {
                    console.log('방문 예약하기 버튼 찾음');
                    reservationBtn.scrollIntoView({behavior: 'instant', block: 'center'});
                    reservationBtn.click();
                    return true;
                }
                return false;
            })()
        "#;

        match page.evaluate_expression(reservation_click_js.to_string()).await {
            Ok(result) => {
                if let Ok(success) = result.into_value::<bool>() {
                    if success {
                        println!("✅ 방문 예약하기 버튼 클릭 완료");
                        tokio::time::sleep(Duration::from_secs(1)).await; // 빠른 진행
                        return Ok(());
                    }
                }
            }
            Err(_) => {}
        }
        
        tokio::time::sleep(Duration::from_secs(2)).await;
    }
    
    Err("방문 예약하기 버튼을 찾을 수 없습니다.".to_string())
}

// 3. 롤렉스 컬렉션 버튼 클릭 (정확한 셀렉터)
pub async fn click_rolex_collection_button(page: &Page) -> Result<(), String> {
    println!("🛍️ 롤렉스 컬렉션 버튼 찾는 중...");
    tokio::time::sleep(Duration::from_secs(2)).await;

    for attempt in 0..5 {
        println!("🛍️ 롤렉스 컬렉션 버튼 클릭 시도 {}/5", attempt + 1);
        
        let rolex_click_js = r#"
            (() => {
                const collectionBtn = document.querySelector('a[onclick="select_type(\'collection\');"]');
                if (collectionBtn && window.getComputedStyle(collectionBtn).display !== 'none') {
                    console.log('롤렉스 컬렉션 버튼 찾음');
                    collectionBtn.scrollIntoView({behavior: 'instant', block: 'center'});
                    collectionBtn.click();
                    return true;
                }
                return false;
            })()
        "#;

        match page.evaluate_expression(rolex_click_js.to_string()).await {
            Ok(result) => {
                if let Ok(success) = result.into_value::<bool>() {
                    if success {
                        println!("✅ 롤렉스 컬렉션 버튼 클릭 완료");
                        tokio::time::sleep(Duration::from_secs(1)).await; // 빠른 진행
                        return Ok(());
                    }
                }
            }
            Err(_) => {}
        }
        
        tokio::time::sleep(Duration::from_secs(2)).await;
    }
    
    Err("롤렉스 컬렉션 버튼을 찾을 수 없습니다.".to_string())
}

// 4. 동의합니다 버튼 클릭 (정확한 셀렉터)
pub async fn click_agree_button(page: &Page) -> Result<(), String> {
    println!("✅ 동의합니다 버튼 찾는 중...");
    tokio::time::sleep(Duration::from_secs(2)).await;

    for attempt in 0..3 {
        println!("✅ 동의합니다 버튼 클릭 시도 {}/3", attempt + 1);
        
        let agree_click_js = r#"
            (() => {
                const agreeBtn = document.querySelector('button.rolex-button');
                if (agreeBtn && window.getComputedStyle(agreeBtn).display !== 'none') {
                    const text = agreeBtn.textContent.trim();
                    if (text.includes('동의합니다')) {
                        console.log('동의합니다 버튼 찾음:', text);
                        agreeBtn.scrollIntoView({behavior: 'instant', block: 'center'});
                        agreeBtn.click();
                        return true;
                    }
                }
                return false;
            })()
        "#;

        match page.evaluate_expression(agree_click_js.to_string()).await {
            Ok(result) => {
                if let Ok(success) = result.into_value::<bool>() {
                    if success {
                        println!("✅ 동의합니다 버튼 클릭 완료");
                        tokio::time::sleep(Duration::from_secs(1)).await; // 빠른 진행
                        return Ok(());
                    }
                }
            }
            Err(_) => {}
        }
        
        tokio::time::sleep(Duration::from_secs(1)).await;
    }
    
    Err("동의합니다 버튼을 찾을 수 없습니다.".to_string())
}

// 5. 방문 날짜 선택 (정확한 셀렉터)
pub async fn select_visit_date(page: &Page, visit_date: &str) -> Result<(), String> {
    println!("📅 방문 날짜 선택 중: {}", visit_date);
    tokio::time::sleep(Duration::from_secs(2)).await;

    // 먼저 예약 마감 메시지가 있는지 확인
    let check_closed_js = r#"
        (() => {
            const body = document.body.textContent;
            return body.includes('온라인 예약이 마감되었습니다') || 
                   body.includes('예약이 마감') ||
                   body.includes('마감');
        })()
    "#;

    match page.evaluate_expression(check_closed_js.to_string()).await {
        Ok(result) => {
            if let Ok(is_closed) = result.into_value::<bool>() {
                if is_closed {
                    return Err("온라인 예약이 마감되었습니다. 다음 예약 오픈 시간을 확인해주세요.".to_string());
                }
            }
        }
        Err(_) => {}
    }

    for attempt in 0..3 {
        println!("📅 방문 날짜 선택 시도 {}/3", attempt + 1);
        
        let date_select_js = format!(r#"
            (() => {{
                const targetDate = '{}';
                const dateBtn = document.querySelector('#appointment .datetime-form .date-list ul > li[data-date="' + targetDate + '"]');
                
                if (dateBtn && !dateBtn.classList.contains('off') && window.getComputedStyle(dateBtn).display !== 'none') {{
                    console.log('날짜 버튼 찾음:', targetDate);
                    dateBtn.scrollIntoView({{behavior: 'instant', block: 'center'}});
                    dateBtn.click();
                    return true;
                }}
                return false;
            }})()
        "#, visit_date);

        match page.evaluate_expression(date_select_js).await {
            Ok(result) => {
                if let Ok(success) = result.into_value::<bool>() {
                    if success {
                        println!("✅ 방문 날짜 선택 완료: {}", visit_date);
                        tokio::time::sleep(Duration::from_secs(1)).await; // 빠른 진행
                        return Ok(());
                    }
                }
            }
            Err(_) => {}
        }
        
        tokio::time::sleep(Duration::from_secs(2)).await;
    }
    
    Err(format!("방문 날짜({})를 선택할 수 없습니다.", visit_date))
}

// 6. 방문 시간 선택 (정확한 셀렉터)
pub async fn select_visit_time(page: &Page, visit_time: &str) -> Result<(), String> {
    println!("🕐 방문 시간 선택 중: {}", visit_time);
    tokio::time::sleep(Duration::from_secs(2)).await;

    // 시간을 분으로 변환 (17:30 -> 1050분)
    let time_in_minutes = convert_time_to_minutes(visit_time)?;

    for attempt in 0..3 {
        println!("🕐 방문 시간 선택 시도 {}/3", attempt + 1);
        
        let time_select_js = format!(r#"
            (() => {{
                const timeValue = '{}';
                const timeBtn = document.querySelector('#appointment .datetime-form .time-list ul > li[data-time="' + timeValue + '"]');
                
                if (timeBtn && !timeBtn.classList.contains('off') && window.getComputedStyle(timeBtn).display !== 'none') {{
                    console.log('시간 버튼 찾음:', timeValue);
                    timeBtn.scrollIntoView({{behavior: 'instant', block: 'center'}});
                    timeBtn.click();
                    return true;
                }}
                return false;
            }})()
        "#, time_in_minutes);

        match page.evaluate_expression(time_select_js).await {
            Ok(result) => {
                if let Ok(success) = result.into_value::<bool>() {
                    if success {
                        println!("✅ 방문 시간 선택 완료: {} ({}분)", visit_time, time_in_minutes);
                        tokio::time::sleep(Duration::from_secs(1)).await; // 빠른 진행
                        return Ok(());
                    }
                }
            }
            Err(_) => {}
        }
        
        tokio::time::sleep(Duration::from_secs(2)).await;
    }
    
    Err(format!("방문 시간({})을 선택할 수 없습니다.", visit_time))
}

// 7. 다음 버튼 클릭 (날짜/시간 선택 후)
pub async fn click_next_button(page: &Page) -> Result<(), String> {
    println!("➡️ 다음 버튼 찾는 중...");
    tokio::time::sleep(Duration::from_secs(2)).await;

    for attempt in 0..3 {
        println!("➡️ 다음 버튼 클릭 시도 {}/3", attempt + 1);
        
        let next_click_js = r#"
            (() => {
                const nextBtn = document.querySelector('button[name="verification"]');
                if (nextBtn && window.getComputedStyle(nextBtn).display !== 'none') {
                    console.log('다음 버튼 찾음');
                    nextBtn.scrollIntoView({behavior: 'instant', block: 'center'});
                    nextBtn.click();
                    return true;
                }
                return false;
            })()
        "#;

        match page.evaluate_expression(next_click_js.to_string()).await {
            Ok(result) => {
                if let Ok(success) = result.into_value::<bool>() {
                    if success {
                        println!("✅ 다음 버튼 클릭 완료");
                        tokio::time::sleep(Duration::from_secs(1)).await; // 빠른 진행
                        return Ok(());
                    }
                }
            }
            Err(_) => {}
        }
        
        tokio::time::sleep(Duration::from_secs(1)).await;
    }
    
    Err("다음 버튼을 찾을 수 없습니다.".to_string())
}

// 8. PASS 인증 처리 (팝업창 대기)
pub async fn handle_pass_authentication(page: &Page, carrier: &str) -> Result<(), String> {
    println!("🔐 PASS 인증 처리 시작 - 통신사: {}", carrier);
    tokio::time::sleep(Duration::from_secs(2)).await;

    // 통신사 선택 시도
    let carrier_select_js = format!(r#"
        (() => {{
            const targetCarrier = '{}';
            const elements = document.querySelectorAll('button, a, option');
            
            for (const el of elements) {{
                const text = el.textContent.trim() || el.value;
                const visible = window.getComputedStyle(el).display !== 'none';
                
                if (visible && text.includes(targetCarrier)) {{
                    console.log('통신사 버튼 찾음:', text);
                    if (el.tagName === 'OPTION') {{
                        el.selected = true;
                        const select = el.closest('select');
                        if (select) select.dispatchEvent(new Event('change'));
                    }} else {{
                        el.click();
                    }}
                    return true;
                }}
            }}
            return false;
        }})()
    "#, carrier);

    match page.evaluate_expression(carrier_select_js).await {
        Ok(result) => {
            if let Ok(success) = result.into_value::<bool>() {
                if success {
                    println!("✅ 통신사 선택 완료: {}", carrier);
                } else {
                    println!("⚠️ 통신사 자동 선택 실패");
                }
            }
        }
        Err(_) => {
            println!("⚠️ 통신사 자동 선택 실패");
        }
    }

    println!("📱 QR 코드 인증을 진행해주세요. 사용자 개입이 필요합니다.");
    println!("⏳ 인증 완료까지 대기 중... (최대 120초)");

    // PASS 인증 팝업창이 사라질 때까지 대기
    for wait_attempt in 0..60 {
        tokio::time::sleep(Duration::from_secs(2)).await;
        
        // 팝업창 또는 인증창이 사라졌는지 확인
        let popup_check_js = r#"
            (() => {
                // 1. 새 창 체크
                if (window.opener) {
                    return false; // 팝업창에 있음
                }
                
                // 2. iframe 체크
                const authIframes = document.querySelectorAll('iframe[src*="pass"], iframe[src*="auth"], iframe[src*="okname"]');
                const visibleIframes = Array.from(authIframes).filter(iframe => 
                    window.getComputedStyle(iframe).display !== 'none'
                );
                
                // 3. 모달/팝업 체크
                const modals = document.querySelectorAll('.modal, .popup, .dialog');
                const visibleModals = Array.from(modals).filter(modal => 
                    window.getComputedStyle(modal).display !== 'none'
                );
                
                // 4. 연락처 정보 입력 폼이 나타났는지 체크
                const contactForm = document.querySelector('input[name="email"]');
                const contactFormVisible = contactForm && window.getComputedStyle(contactForm).display !== 'none';
                
                return visibleIframes.length === 0 && visibleModals.length === 0 && contactFormVisible;
            })()
        "#;

        match page.evaluate_expression(popup_check_js.to_string()).await {
            Ok(result) => {
                if let Ok(auth_complete) = result.into_value::<bool>() {
                    if auth_complete {
                        println!("✅ PASS 인증 완료 (연락처 정보 입력 단계로 진행)");
                        return Ok(());
                    }
                }
            }
            Err(_) => {}
        }
        
        if wait_attempt % 10 == 9 { // 20초마다 상태 출력
            println!("⏳ PASS 인증 대기 중... ({}초 경과)", (wait_attempt + 1) * 2);
        }
    }
    
    Err("PASS 인증 시간 초과 (120초)".to_string())
}

// 9. 이메일 입력 및 최종 예약 (정확한 셀렉터)
pub async fn submit_final_reservation(page: &Page, email: &str) -> Result<(), String> {
    println!("📧 이메일 입력 및 최종 예약 처리");
    tokio::time::sleep(Duration::from_secs(2)).await;

    // 이메일 입력
    let email_input_js = format!(r#"
        (() => {{
            const email = '{}';
            const emailInput = document.querySelector('input[name="email"]');
            
            if (emailInput && window.getComputedStyle(emailInput).display !== 'none') {{
                emailInput.value = email;
                emailInput.dispatchEvent(new Event('input'));
                emailInput.dispatchEvent(new Event('change'));
                console.log('이메일 입력 완료:', email);
                return true;
            }}
            return false;
        }})()
    "#, email);

    match page.evaluate_expression(email_input_js).await {
        Ok(result) => {
            if let Ok(success) = result.into_value::<bool>() {
                if success {
                    println!("✅ 이메일 입력 완료: {}", email);
                } else {
                    println!("⚠️ 이메일 입력 실패");
                }
            }
        }
        Err(_) => {
            println!("⚠️ 이메일 입력 중 오류 발생");
        }
    }

    tokio::time::sleep(Duration::from_secs(1)).await;

    // 마케팅 동의 체크박스 선택
    let checkbox_js = r#"
        (() => {
            const consentCheckbox = document.querySelector('input[name="reception_consent"]');
            
            if (consentCheckbox && window.getComputedStyle(consentCheckbox).display !== 'none') {
                if (!consentCheckbox.checked) {
                    consentCheckbox.click();
                    console.log('마케팅 동의 체크박스 선택 완료');
                    return true;
                }
                return true; // 이미 선택됨
            }
            return false;
        })()
    "#;

    match page.evaluate_expression(checkbox_js.to_string()).await {
        Ok(result) => {
            if let Ok(success) = result.into_value::<bool>() {
                if success {
                    println!("✅ 마케팅 동의 체크박스 처리 완료");
                } else {
                    println!("⚠️ 마케팅 동의 체크박스 처리 실패");
                }
            }
        }
        Err(_) => {}
    }

    tokio::time::sleep(Duration::from_secs(1)).await;

    // 최종 제출 버튼 클릭
    let submit_js = r#"
        (() => {
            const submitBtn = document.querySelector('button[type="submit"][name="submit_appointment"]');
            
            if (submitBtn && window.getComputedStyle(submitBtn).display !== 'none') {
                console.log('최종 제출 버튼 찾음:', submitBtn.textContent.trim());
                submitBtn.scrollIntoView({behavior: 'instant', block: 'center'});
                submitBtn.click();
                return true;
            }
            return false;
        })()
    "#;

    match page.evaluate_expression(submit_js.to_string()).await {
        Ok(result) => {
            if let Ok(success) = result.into_value::<bool>() {
                if success {
                    println!("✅ 최종 제출 버튼 클릭 완료");
                    tokio::time::sleep(Duration::from_secs(2)).await; // 제출 후 대기
                    return Ok(());
                }
            }
        }
        Err(_) => {}
    }
    
    Err("최종 제출 버튼을 찾을 수 없습니다.".to_string())
}

// 10. 성공 페이지 확인
pub async fn check_success_page(page: &Page) -> Result<bool, String> {
    println!("🎉 예약 성공 여부 확인 중...");
    tokio::time::sleep(Duration::from_secs(3)).await;

    let success_check_js = r#"
        (() => {
            const url = window.location.href;
            const body = document.body.textContent.toLowerCase();
            
            // 크로노디그마 성공 페이지 URL 패턴
            const urlSuccess = url.includes('/success') || 
                             url.includes('/complete') || 
                             url.includes('/confirmation');
            
            // 성공 메시지 확인
            const bodySuccess = body.includes('완료') ||
                              body.includes('성공') ||
                              body.includes('예약이 접수') ||
                              body.includes('신청이 완료') ||
                              body.includes('감사합니다');
            
            return urlSuccess || bodySuccess;
        })()
    "#;

    match page.evaluate_expression(success_check_js.to_string()).await {
        Ok(result) => {
            if let Ok(is_success) = result.into_value::<bool>() {
                if is_success {
                    println!("🎉 예약 성공 확인!");
                    return Ok(true);
                } else {
                    println!("❌ 예약 실패 또는 상태 불명");
                    return Ok(false);
                }
            }
        }
        Err(_) => {}
    }
    
    Ok(false)
}

// 시간을 분으로 변환하는 유틸리티 함수
fn convert_time_to_minutes(time_str: &str) -> Result<i32, String> {
    let parts: Vec<&str> = time_str.split(':').collect();
    if parts.len() < 2 {
        return Err(format!("잘못된 시간 형식: {}", time_str));
    }
    
    let hours: i32 = parts[0].parse().map_err(|_| "시간 파싱 오류")?;
    let minutes: i32 = parts[1].parse().map_err(|_| "분 파싱 오류")?;
    
    Ok(hours * 60 + minutes)
}

// 유틸리티 함수
pub fn log_user_action(action: &str, details: &str) {
    let timestamp = chrono::Utc::now().format("%H:%M:%S");
    println!("🎯 [{}] {}: {}", timestamp, action, details);
}
