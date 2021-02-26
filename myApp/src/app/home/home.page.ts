import { Component } from '@angular/core';


import { FileOpener } from '@ionic-native/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';
import { Filesystem, FilesystemDirectory, Plugins } from '@capacitor/core';
import { HttpClient, HttpEventType } from '@angular/common/http';

import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { Platform } from '@ionic/angular';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';


const   { FileSystem, Storage } = Plugins;

export const FILE_KEY = 'files'



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  //variables for download status
  percent: number;
  started:boolean = false;
  fileTransfer: FileTransferObject = this.transfer.create();

  //imageUrl  = 'https://file-examples-com.github.io/uploads/2017/10/file_example_PNG_500kB.png'
  pdfUrl    = 'https://file-examples-com.github.io/uploads/2017/10/file-sample_150kB.pdf'
  videoUrl  = 'https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4'
  imageUrl  = 'https://file-examples-com.github.io/uploads/2017/10/file_example_PNG_500kB.png'


  downloadUrl = ''
  mYFiles = []
  downloadProgress = 0
  

//{}
  constructor(private nativeHTTP: HttpClient,
              private fileOpener: FileOpener,
              private file: File,
              private browser: InAppBrowser,
              private platform: Platform,
              private transfer: FileTransfer) 
              {
                this.loadFiles()
              }
            



              private downloadFileAndStore()
              {
                /*const filePath = this.file.dataDirectory + this.file.getFile.name; 
                         // for iOS use this.file.documentsDirectory
        
                this.nativeHTTP.downloadFile(this.imageUrl, {}, {}, filePath).then(response => {
                  // prints 200
                  console.log('success block...', response);
                }).catch(err => {
                    // prints 403
                    console.log('error block ... ', err.status);
                    // prints Permission denied
                    console.log('error block ... ', err.error);
                })*/
              }


  

  async loadFiles()
  {
    
    const videoList = await Storage.get({
      key: FILE_KEY
    })

    this.mYFiles = JSON.parse(videoList.value) || []
  }
        
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader
    reader.onerror = reject
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.readAsDataURL(blob)
  })

  private getMimetype(name)
  {
    if(name.indexOf('pdf') >= 0 )
    {
        return 'application/pdf'
    }
    else if(name.indexOf('png') >= 0)
    { 
        return 'image/png'
    }
    else if(name.indexOf('mp4') >= 0)
    {
      return 'video/mp4'
    }
  }

  /*downloadFile(url?)
  {
    console.log("O url ", url);
    
    this.downloadUrl = url ? url : this.downloadUrl
    

    this.nativeHTTP.get(this.downloadUrl, {
      responseType: 'blob',
      reportProgress: true,
      observe: 'events'
    }).subscribe(async event => {
      if (event.type == HttpEventType.DownloadProgress)
      {
          this.downloadProgress = Math.round((100 * event.loaded) / event.total)
      }
      else if (event.type == HttpEventType.Response)
      {
         this.downloadProgress = 0 

         const name   = this.downloadUrl.substr(this.downloadUrl.lastIndexOf('/') + 1)
         const base64 = await this.convertBlobToBase64(event.body) as string

         const savedFile = await Filesystem.writeFile({
           path       : name,
           data       : base64,
           directory  : FilesystemDirectory.Documents, 
         })

         

         //const uriPath  = await Filesystem.getUri({
           //directory: FilesystemDirectory.Documents,
           //path: name
         //})

         const path     = savedFile.uri
         const mimeType = this.getMimetype(name)

         this.file.open(path, mimeType)
         .then(() => console.log("File is opened"))
         .catch(error => console.log('Error openening file', error)) 


         this.mYFiles.unshift(path)

         Storage.set({
          key    : FILE_KEY,
          value  : JSON.stringify(this.mYFiles)
        })
         

         console.log('Saved as : ', savedFile);
         //11:28
      }
    })
  }*/


  openPDF(url) {
    console.log("openPDF called; url: ", url);
    //var objectUrl = URL.createObjectURL(url);
    
    // this.fileOpener.open(url, 'application/pdf')
    // .then(() => console.log('File is opened'))
    // .catch(e => console.log('Error opening file', e));
    
    if( this.platform.is('android') ){
      window.open('https://docs.google.com/viewerng/viewer?url='+url, '_blank') 
    }else if(this.platform.is('ios')){
      //let path = this.file.documentsDirectory;
      window.open(url);
      // let filename  = (url.resourceName).replace(/ /g, "%20");
      // filename.slice(-1) == "." ? filename = filename.slice(0, -1) : filename = filename;

      // const transfer = this.transfer.create();
      // transfer.download(url.resourceUrl,path + filename + '.pdf').then(entry => {
      //   let url = entry.toURL();
      //   this.documentViewer.viewDocument(url,'application/pdf',{});
      // });

    }else{
      //Attempt with IAB
      let browser = this.browser.create(
        url,
        '_blank',
        'location=yes,' +
        'toolbar=yes,' +
        'enableViewportScale=yes,' +
        'closebuttoncaption=Close PDF,' +
        'hardwareback=no'
      );
      browser.show();
    }
    //URL.revokeObjectURL(objectUrl);
  }

  download(fileUrl, type) { 
    console.log("downloadFile called (fileData, type): ", fileUrl, type);
    
    let path = null;

    if (this.platform.is('ios')) {
      path = this.file;
      console.log("iOS path: ", path);
      this.downloadPDF(path, fileUrl);
    }
    else if (this.platform.is('android')) {
      //On Jon's phone, the externalDataDirectory works! file:///storage/emulated/0/Android/data/org.equipmoz.fonte/files/teste.pdf
      path = this.file.externalDataDirectory;
      console.log("Android path: ", path);
      this.downloadPDF(path, fileUrl);
    }
    else {
      console.log("Download called; not android or ios; assumed web");

      if (type == 'book') { this.openPDF(fileUrl); }
      if (type == 'audio') { this.openAudio(fileUrl.audioUrl); }
    }

    switch(type) {
      case "book":
        this.downloadPDF(path, fileUrl);
        break;
      case "bible":
        //this.downloadAudio(path, fileData, type, metadata);
        console.log("Bible");
        
        break;
      case "teaching": {
        //this.downloadAudio(path, fileData, type, metadata);
        console.log("Audio");
        
        break;
      }
      default:
        console.error("Unexpected type returned");
    }
    return;
  }//download function end


  openAudio(fileData) {
    this.browser.create(fileData);
  }

  downloadPDF1() {
    const url = 'https://file-examples-com.github.io/uploads/2017/10/file-example_PDF_1MB.pdf';
    this.fileTransfer.download(url, this.file.dataDirectory + '/MyTestFiles/pdf' + 'file.pdf').then((entry) => {
      console.log('download complete: ' + entry.toURL());
      const mimeType = this.getMimetype(name)

        //FilesystemDirectory.


         this.fileOpener.open(this.file.dataDirectory + '/MyTestFiles/pdf' + 'file.pdf', mimeType)
         .then(() => console.log("File is opened"))
         .catch(error => console.log('Error openening file', error)) 
    }, (error) => {
      // handle error
      alert("ERROR: \n AUDIO DOWNLOAD FAILED. ");
      console.log("Bug ",error);
      
    });
  }

  downloadPDF2() {
    const url = 'https://file-examples-com.github.io/uploads/2017/10/file-example_PDF_1MB.pdf';
    this.fileTransfer.download(url, this.file.documentsDirectory + '/MyTestFiles/pdf' + 'file1.pdf').then((entry) => {
      console.log('download complete: ' + entry.toURL());

      const mimeType = this.getMimetype(name)

         this.fileOpener.open(this.file.documentsDirectory + '/MyTestFiles/pdf' + 'file1.pdf', mimeType)
         .then(() => console.log("File is opened"))
         .catch(error => console.log('Error openening file', error)) 
    }, (error) => {
      // handle error
      alert("ERROR: \n AUDIO DOWNLOAD FAILED. ");
      console.log("Bug ",error);
      
    });
  }

  downloadPDF3() {
    
    const url = 'https://file-examples-com.github.io/uploads/2017/10/file_example_PNG_3MB.png';
    this.fileTransfer.download(url, this.file.dataDirectory + 'file.png').then((entry) => {
      console.log('download complete: ' + entry.toURL());
    }, (error) => {
      // handle error
      alert("ERROR: \n AUDIO DOWNLOAD FAILED. ");
      console.log("Bug ",error);
      
    });
  }

  //https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_5MG.mp3

  downloadPDF4() {
    const url = 'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_5MG.mp3';
    this.fileTransfer.download(url, this.file.dataDirectory + 'file.mp3').then((entry) => {
      console.log('download complete: ' + entry.toURL());
    }, (error) => {
      // handle error
      alert("ERROR: \n AUDIO DOWNLOAD FAILED. ");
      console.log("Bug ",error);
      
    });
  }

  downloadPDF(path, url)
  {
    if (!this.platform.is('cordova')) {
      this.browser.create(url);
    }

    else {
      
      let filename  = (url).replace(/ /g, "%20");
       filename.slice(-1) == "." ? filename = filename.slice(0, -1) : filename = filename;
       
       const transfer = this.transfer.create();
       //transfer.download(url, path)
       transfer.download(url, path + filename + ".pdf", true).then(
        entry => {
          console.log("Download successful: ", JSON.stringify(entry));
          let url = entry.nativeURL;

          //register download on API (counter)
          //Actualiza API
          //this.updateDhitOnAPI('resource', fileData.id);

          //this.platform.is('cordova') ? this.document.viewDocument(url, 'application/pdf', {}) : this.openPDF(url);
          //this.bookDownloadSuccess(url, fil);
          //this.openPDF(url);
        },
        failure => {
          alert("ERROR: \n AUDIO DOWNLOAD FAILED. ");
        }
      );
      transfer.onProgress((ProgressEvent) => {
        if(ProgressEvent.lengthComputable){
          this.percent = Math.floor(ProgressEvent.loaded / ProgressEvent.total * 100);
          console.log("Percentagem : ",this.percent);
          
        }
      })
    }

  }

}
