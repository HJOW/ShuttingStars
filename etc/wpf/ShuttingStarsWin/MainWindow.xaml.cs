using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace ShuttingStarsWin
{
    /// <summary>
    /// MainWindow.xaml에 대한 상호 작용 논리
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            initWebView();
            sswebview.Focus();
        }

        private async void initWebView() {
            await sswebview.EnsureCoreWebView2Async(null);
            
            string url = "https://app.local/game.html";
            
            string local = System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "web");
            sswebview.CoreWebView2.SetVirtualHostNameToFolderMapping("app.local", local, Microsoft.Web.WebView2.Core.CoreWebView2HostResourceAccessKind.Allow);
            
            sswebview.CoreWebView2.Navigate(url);
            sswebview.Focus();
        }
    }
}
