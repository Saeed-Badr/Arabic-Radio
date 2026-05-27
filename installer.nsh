!include MUI2.nsh

; إعدادات نافذة اختيار اللغة
!define MUI_LANGDLL_REGISTRY_ROOT "HKCU"
!define MUI_LANGDLL_REGISTRY_KEY "Software\Arabic Radio"
!define MUI_LANGDLL_REGISTRY_VALUENAME "Installer Language"

; الصفحات
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; اللغات المدعومة
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "Arabic"

; عرض نافذة اختيار اللغة عند البدء
Function .onInit
  !insertmacro MUI_LANGDLL_DISPLAY
FunctionEnd

; كتابة config.json بعد التثبيت
Section -ConfigWriter
  CreateDirectory "$APPDATA\Arabic Radio"
  FileOpen $0 "$APPDATA\Arabic Radio\config.json" w
  ${If} $LANGUAGE == 1033
    FileWrite $0 '{ "language": "en" }$\r\n'
  ${Else}
    FileWrite $0 '{ "language": "ar" }$\r\n'
  ${EndIf}
  FileClose $0
SectionEnd