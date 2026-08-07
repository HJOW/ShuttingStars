using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Reflection;
using System.Windows;
using System.IO;

namespace ShuttingStarsWin
{
    /*
    단일 exe 생성
        - App 생성자에서 어셈블리 이벤트 부여
        - 어셈블리 이벤트 핸들러 메소드 구현 (복붓해도 될 듯)
        - 프로젝트 내 Libraries 폴더를 만들기 (사실 이름은 아무래도 상관없다고 함)
        - 일단 프로젝트 빌드 후, 프로젝트 폴더 내 bin / Debug 디렉토리에 들어가서, 생성된 dll 파일들을 Libraries 폴더 안으로 끌어넣기 (비주얼 스튜디오 창 내 솔루션 탐색기 안으로 끌어와야 인식함)
        - Libraries 폴더 내 파일들 전부 선택 후, 마우스 오른쪽 버튼 클릭 - 속성 클릭 (비주얼 스튜디오 내 솔루션 탐색기에서 해야 함)
        - 속성 창 안에 "빌드 작업" 항목의 값을 "포함 리소스" 로 선택
        - 다시 빌드 후 bin / Debug 폴더로 가보면, exe 파일 크기가 비대해져 있음. 이것만 꺼내서 테스트
    */
    /// <summary>
    /// App.xaml에 대한 상호 작용 논리
    /// </summary>
    public partial class App : Application
    {
        public App() {
            // 어셈블리 이벤트 부여 - 단일 exe 생성에 사용
            AppDomain.CurrentDomain.AssemblyResolve += new ResolveEventHandler(ResolveAssembly);
        }

        // 어셈블리 이벤트 핸들러 정의 - 단일 exe 생성에 사용
        // 참고 : https://nsinc.tistory.com/171
        private static Assembly ResolveAssembly(object sender, ResolveEventArgs args)
        {
            Assembly thisAssembly = Assembly.GetExecutingAssembly();
            AssemblyName assemblyName = new AssemblyName(args.Name);
            string name = args.Name.Substring(0, args.Name.IndexOf(",")) + ".dll";
            var resources = thisAssembly.GetManifestResourceNames().Where(s => s.EndsWith(name));
            if (resources.Any())
            {
                var resourceName = resources.First();
                using (Stream stream = thisAssembly.GetManifestResourceStream(resourceName))
                {
                    if (stream == null) return null;
                    var block = new byte[stream.Length];
                    stream.Read(block, 0, block.Length);
                    return Assembly.Load(block);
                }
            }
            return null;
        }
    }
}
