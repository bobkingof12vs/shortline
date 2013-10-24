
#include <math.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct{
	float x;
	float y;
	float z;
} vector;

typedef struct{
  char  name[255];
  int   colNum;
  float r;
  float g;
  float b;
} color;

float distance3d(vector u, vector v){
  return sqrt(pow((v.x-u.x),2)+pow((v.y-u.y),2)+pow((v.z-u.z),2));
}

float distance2d(vector u, vector v,char type){
  if(type=='x'){return sqrt(pow((v.x-u.x),2)+pow((v.y-u.y),2));}
  if(type=='y'){return sqrt(pow((v.y-u.y),2)+pow((v.z-u.z),2));}
  if(type=='z'){return sqrt(pow((v.x-u.x),2)+pow((v.z-u.z),2));}
}

vector lerp1(vector u1, vector u2, float t){
  vector l;
  l.x = u1.x + ((u2.x-u1.x)*t);
  l.y = u1.y + ((u2.y-u1.y)*t);
  l.z = u1.z + ((u2.z-u1.z)*t);
  return l;
}

vector lerp2(vector u1, vector u2, vector v1, vector v2, float t){
  vector l1 = lerp1(u1,u2,t);
  vector l2 = lerp1(v1,v2,t);
  vector l3 = lerp1(l1,l2,t);
  return l3;
}

vector lineIntersect(char *type, vector  u1, vector  u2, vector  v1, vector  v2){
  float bx,by,dx,dy,cx,cy;
  if(*type == 'a'){
    bx = u2.x - u1.x; 
    by = (u2.y+u2.z) - (u1.y+u1.z) ; 
    dx = v2.x - v1.x; 
    dy = (v2.y+v2.z)  - (v1.y+v1.z) ;
    cx = v1.x - u1.x;
    cy = (v1.y+v1.z) - (u1.y+u1.z);
  }
  if(*type == 'x'){
    bx = u2.x - u1.x; 
    by = u2.y - u1.y; 
    dx = v2.x - v1.x; 
    dy = v2.y - v1.y;
    cx = v1.x - u1.x;
    cy = v1.y - u1.y;
  }
  if(*type == 'y'){
    bx = u2.y - u1.y; 
    by = u2.z - u1.z; 
    dx = v2.y - v1.y; 
    dy = v2.z - v1.z;
    cx = v1.y - u1.y;
    cy = v1.z - u1.z;
  }
  if(*type == 'z'){
    bx = u2.x - u1.x; 
    by = u2.z - u1.z; 
    dx = v2.x - v1.x; 
    dy = v2.z - v1.z;
    cx = v1.x - u1.x;
    cy = v1.z - u1.z;
  }
  float b_dot_d_perp = bx * dy - by * dx;
  if(b_dot_d_perp == 0) {
    *type = 'n';
    return;
  }
  float t = (cx * dy - cy * dx) / b_dot_d_perp;
  if(t < 0 | t > 1) {
    *type = 'n';
    return;
  }
  float u = (cx * by - cy * bx) / b_dot_d_perp;
  if(u < 0 | u > 1) {
    *type = 'n';
    return;
  }
  vector vec;
  if(*type == 'a'){vec.x = 0; vec.y = 0; vec.z = 0;}
  if(*type == 'x'){vec.x = u1.x+t*bx; vec.y = u1.y+t*by; vec.z = 0;}
  if(*type == 'y'){vec.x = 0; vec.y = u1.x+t*bx; vec.z = u1.y+t*by;}
  if(*type == 'z'){vec.x = u1.x+t*bx; vec.y = 0; vec.z = u1.y+t*by;}
  return vec;
}

char * scanWord(FILE *handle){ 
  char op = ' ';
  char *arr;
  arr = malloc(sizeof(char));
  int i = -1;
  while(op != EOF | isspace(op) == 1){
    op = fgetc(handle);
    if(isspace(op)!=1){
      i++;
      arr = (char*) realloc (arr, (i+1)* sizeof(char));
      arr[i] = op;
    }
    else {
      ungetc(op,handle);
      return arr;
    }
  }
  ungetc(op,handle);
  return arr;
}

int main( int argc, char *argv[] ){
  
  char OBJpath[255];
  char MTLpath[255];
  
  snprintf(OBJpath, sizeof OBJpath, "%s/%s.obj", argv[1], argv[2]);
  snprintf(MTLpath, sizeof MTLpath, "%s/%s.mtl", argv[1], argv[2]);
  
  char lf, op;
  
  vector *vec;
  vec = (vector*) malloc (sizeof(vector));
  vec[0].x = -1;vec[0].y = -1;vec[0].z = -1;
  
  int** face;
  face = (int**) malloc (sizeof(int));
  
  FILE *fmtl;
  fmtl = fopen(MTLpath,"r");
	if (fmtl == NULL) {
		printf("can't open %s\n",MTLpath);
		exit(1);
	}
  
  int c = -1,i = 0,j,k;
  float in[3];
  char colName[255];
  char *buffer;
  buffer = malloc(255*(sizeof(char)));
  char chk;
  color *col;
  col = (color*) malloc (sizeof(color));
  
  while(chk != EOF){
    strncpy(buffer, "", sizeof(*buffer));
    buffer = scanWord(fmtl);
    chk = fgetc(fmtl);
    if(strcmp(buffer, "newmtl") == 0){
      buffer = scanWord(fmtl);
      chk = fgetc(fmtl);
      strcpy(colName,buffer);
    }
    if(strcmp(buffer, "Kd") == 0){
      c++;
      col = (color*) realloc (col, (c+1)* sizeof(color));
      col[c].colNum = c;
      strcpy(col[c].name,colName);
      fscanf(fmtl,"%f",&col[c].r);
      fscanf(fmtl,"%f",&col[c].g);
      fscanf(fmtl,"%f",&col[c].b);
    }
  }

  fclose(fmtl);
  
	//open obj file
	FILE *fobj;
  fobj = fopen(OBJpath,"r");
	if (fobj == NULL) {
		printf("can't open %s\n",OBJpath);
		exit(1);
	}
  
  int v = 0, f = -1, fn = -1;
  int getf;
  char endl;
  char *buff = malloc (255*sizeof(char));
  char linefeed[sizeof fobj];
  while(lf != EOF){
    lf = fgetc(fobj);
    if(lf == 'v'){
      v++;
      //realloc memory to fit all
      vec = (vector*) realloc (vec, (v+1)* sizeof(vector));
      fscanf(fobj,"%f",&vec[v].x);
      fscanf(fobj,"%f",&vec[v].y);
      fscanf(fobj,"%f",&vec[v].z);
      fgets(linefeed,sizeof(fobj),fobj);
    }
    else if(lf == 'f'){
      fgetc(fobj);
      f++;
      fn = 1;
      face[f] = (int*) malloc (2*sizeof(int));
      face[f][0] = f;
      face[f][1] = 1;
      op =  ' ';
      while(op != '\n'){
        fn++;
        face[f][1] = face[f][1]++;
        strncpy(buff, "", sizeof(buff));
        buff = scanWord(fobj);
        face[f] = (int*) realloc (face[f], (fn+1)*sizeof(int));
        face[f][fn] =  atoi(buff);
        op = fgetc(fobj);
      }
    }
    else{fgets(linefeed,sizeof(fobj),fobj);}
  }
  
  fclose(fobj);
  
  vector vin1,vin2;
  char * type = malloc(sizeof(char));
  *type = 'p';
  
  float minD,maxD,tempD;
  
  //find info needed to build triangles

  minD = distance3d(vec[0],vec[1]);
  maxD = distance3d(vec[0],vec[1]);
  //note that we only minus one here because we are looking for the
  //greatest distance between any two points
  for (j = 1; j <= v-1; j++){
    tempD = distance3d(vec[j],vec[j+1]);
    if(tempD<=minD){minD = tempD;}
    if(tempD>=maxD){maxD = tempD;}
  }
  
  j = 0;
  for (i = 0; i <= f; i++){
    j += face[f][1];
  }
  
  minD = (minD/3);
  maxD = (maxD*3);
  
  //build tris
  
  bool *taken = malloc (sizeof(bool));
  bool alltaken = 0;
  int intrCount = 0;
  int p1,p2,p3,pc;
  int tri[f+1][j-1][2];
  int triCount;
  
  for (i = 0;i <= f; i++){
    //resize/reset the bool array, used to mark what point is taken.
    taken = (bool*) realloc (taken, (face[i][1]+3)*sizeof(bool));
    for(j = 0; j <= face[i][1]+2; j++){ taken[j] = 0 ;}
    alltaken = 0;
    triCount = 0;
    while(alltaken == 0){
      k=0;
      while(pc <= 1){
        k++;
        if(k==7){break;}
        //find the first three points that aren't taken
        p1=0;p2=0;p3=0;pc=0;
        while(taken[p1+2]==1){
          p1++;
        }
        while(taken[p2+2]==1 & p2!=p1){
          p2++;
          if(p2>face[i][1]+3){
            p2=0;
          }
        }
        while((taken[p3+2]==1 & p3!=p1 & p3!=p1) | pc < 1){
          p3++;
          if(p3>face[i][1]+3){
            p3=0;
            pc++;
          }
        }
        if (pc > 1){break;}
        
        //this finds the mid point of the triangle that makes
        vin1 = lerp2(vec[face[i][p1]],
          vec[face[i][p2]],
          vec[face[i][p2]],
          vec[face[i][p3]],
          .5);
        //this is an arbitrary point most certaintly outside of the triangle
        vin2.x = vin1.x + maxD;
        vin2.y = vin1.y + maxD;
        vin2.z = vin1.z + maxD;
        intrCount = 0;
        //loop through every line and count the intersecttions
        for (j = 2; j <= face[i][1]-1; j++){
          if(p1!=j & p2!=j & p3!=j){
            *type = 'a'; lineIntersect(type, vin1, vin2, vec[face[i][j]], vec[face[i][j+1]]);
            if(*type!='e'){intrCount++;}
          }
        }
        //if its even we are out, if it is odd, we are in.
        if((((int)round((double)intrCount/2)*2)!=(double)intrCount)){
          //now check if any point lies inside of this triangle
          for (j = 2; j <= face[i][1]; j++){  
            if(p1!=j & p2!=j & p3!=j){
              
              vin2.x = vec[face[i][j]].x+maxD;
              vin2.y = vec[face[i][j]].y+maxD;
              vin2.z = vec[face[i][j]].z+maxD;
              intrCount = 0;
              
              *type='a'; vin1 = lineIntersect(type, vec[face[i][j]], vin2, vec[face[i][p1]], vec[face[i][p2]]);
              printf("\n%f, %f, %f ",vin1.x,vin1.y,vin1.z);
              if(*type!='e'){intrCount++;}
              *type='a'; vin1 = lineIntersect(type, vec[face[i][j]], vin2, vec[face[i][p2]], vec[face[i][p3]]);
              printf("\n%f, %f, %f ",vin1.x,vin1.y,vin1.z);
              if(*type!='e'){intrCount++;}
              *type='a'; vin1 = lineIntersect(type, vec[face[i][j]], vin2, vec[face[i][p3]], vec[face[i][p1]]);
              printf("\n%f, %f, %f ",vin1.x,vin1.y,vin1.z);
              if(*type!='e'){intrCount++;}
              
              if(intrCount == 1){
                taken[p2]=1;
                triCount++;
                tri[i][0][0] = face[i][0];
                tri[i][0][1] = triCount;
                tri[i][triCount][0] = p1;
                tri[i][triCount][1] = p2;
                tri[i][triCount][2] = p3;
              }
            }
          }
        }
      }
      alltaken = 1;
      for(j = 2; j <= face[i][1]+2; j++){
        if(taken[j]==0){
          alltaken = 0;
        }
        printf(" %d",alltaken?1:0);
      }
      printf("\n");
    }
  }
  
  
  for(i = 0; i <= v; i++){
    printf("\nv %f, %f, %f",vec[i].x,vec[i].y,vec[i].z);
  }
  free(vec);
  for(i = 0; i <= f; i++){
    printf("\n col",i);
    for(j = 1; j <= tri[f][0][1]; j++){
      printf("\nf %d %d %d", tri[f][j][0],tri[f][j][1],tri[f][j][2]);
    }
    free(face[i]);
  }
  free (face);
  //for(i = 0; i <= c; i++){
    //printf("\n col: %s, num:%d, rgb: %f, %f, %f",col[i].name,col[i].colNum,col[i].r,col[i].g,col[i].b);
  //}
  free(col);
  //printf("\n");
  
}