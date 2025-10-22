#include <SparkFun_TB6612.h>
#include <NewPing.h>

//Motor pin definition
#define AIN1 7
#define BIN1 9
#define AIN2 4
#define BIN2 10
#define PWMA 3
#define PWMB 11
#define STBY A1

//Determines direction of each motor. 1 or -1
const int offsetA = 1;
const int offsetB = 1;

//Motor Initialization
Motor motor1 = Motor(AIN1, AIN2, PWMA, offsetA, STBY);
Motor motor2 = Motor(BIN1, BIN2, PWMB, offsetB, STBY);

const int cols=10;
const int rows=10;

int visited[cols][rows];
double hueristic[cols][rows];

// Declaring start goal and various other variables
int startx=1;
int starty=1;
int goalx=2;
int goaly=3;
int locx;
int locy;
int index;
double costarray[8] ;
double f;
int g = 1;
int maxval = 100;

void setup(){
  Serial.begin(9600);
  //Calculating hueristic 
  for(int i=0; i<cols; i++){
    for(int j=0; j<rows; j++){
      visited[i][j]=0;
    }
  }
  if((goaly < rows && goalx < cols  && goalx > -1 && goaly > -1 ) ){
    for(int i = 0; i <rows; i++){
      for(int j = 0; j <cols; j++){
        hueristic[j][i] = sqrt( ((j-goalx)*(j-goalx)) + ((i-goaly)*(i-goaly)) );
        if (visited[j][i] == 1){
          hueristic[j][i] = hueristic[j][i] + 50 ;
        }
      }
    }
  }

 locx = startx;
 locy = starty;
}

void loop(){ 
  // 0 index for up/forward. 1 for right. 2 for down/backward. 3 for left. 4 for up-left. 5 for down right. 6 for down left. 7 for up right.
  //Assigns costs and prioritizes bots movement.
  costarray[0] = g + hueristic[locx-1][locy];
  costarray[1] = g + hueristic[locx][locy+1];
  costarray[2] = g + hueristic[locx+1][locy]; 
  costarray[3] = g + hueristic[locx][locy-1];
  costarray[4] = g + hueristic[locx-1][locy-1];
  costarray[5] = g + hueristic[locx+1][locy+1];
  costarray[6] = g + hueristic[locx+1][locy-1]; 
  costarray[7] = g + hueristic[locx-1][locy+1];

  //Finding node with least cost
  for(int i=0;i<8;i++){ 
    if(costarray[i] < maxval){
      index = i;
      maxval = costarray[i];
    }
  }
  visited[locx][locy]=1;

  //Move your position to the new location
  if(index == 0){
    locx = locx-1;
    forward(motor1, motor2, 100);
    delay(2000);
    brake(motor1, motor2);
    delay(500);
  }
  else if(index == 1){
    locy = locy+1;
    right(motor1, motor2, 150);
    delay(2000);
    brake(motor1, motor2);
    delay(500);
    forward(motor1, motor2, 100);
    delay(2000);
    brake(motor1, motor2);
    delay(500);
    left(motor1, motor2, 150);
    delay(2000);
    brake(motor1, motor2);
    delay(500);
  }
  else if(index == 2){
    locx = locx+1;
    back(motor1, motor2, -100);
    delay(2000);
    brake(motor1, motor2);
    delay(500);
  }
  else if(index == 3){
    locy = locy-1;
    left(motor1, motor2, 150);
    delay(2000);
    brake(motor1, motor2);
    delay(500);
    forward(motor1, motor2, 100);
    delay(2000);
    brake(motor1, motor2);
    delay(500);
    right(motor1, motor2, 150);
    delay(2000);
    brake(motor1, motor2);
    delay(500);
  }
  else if(index == 4){
    locy = locy-1;
    locx = locx-1;
    left(motor1, motor2, 150);
    delay(1000);
    brake(motor1, motor2);
    delay(500);
    forward(motor1, motor2, 100);
    delay(2000);
    brake(motor1, motor2);
    delay(500);
    right(motor1, motor2, 150);
    delay(1000);
    brake(motor1, motor2);
    delay(500);
  }
  else if(index == 5){
    locy = locy+1;
    locx = locx+1;
    left(motor1, motor2, 150);
    delay(1000);
    brake(motor1, motor2);
    delay(500);
    back(motor1, motor2, 100);
    delay(2000);
    brake(motor1, motor2);
    delay(500);
    right(motor1, motor2, 150);
    delay(1000);
    brake(motor1, motor2);
    delay(500);
  }
  else if(index == 6){
    locy = locy-1;
    locx = locx+1;
    right(motor1, motor2, 150);
    delay(1000);
    brake(motor1, motor2);
    delay(500);
    back(motor1, motor2, 100);
    delay(2000);
    brake(motor1, motor2);
    delay(500);
    left(motor1, motor2, 150);
    delay(1000);
    brake(motor1, motor2);
    delay(500);
  }
  else if(index == 7){
    locy = locy+1;
    locx = locx-1;
    right(motor1, motor2, 150);
    delay(1000);
    brake(motor1, motor2);
    delay(500);
    forward(motor1, motor2, 100);
    delay(2000);
    brake(motor1, motor2);
    delay(500);
    left(motor1, motor2, 150);
    delay(1000);
    brake(motor1, motor2);
    delay(500);
  }

  Serial.print("(");
  Serial.print(locx);
  Serial.print(",");
  Serial.print(locy);
  Serial.print(")");
  Serial.println();
  if(locx == goalx && locy == goaly)
  {Serial.println("target reached");
  for(;;);
  }
 /* for when bot reaches desination
 if(locx == goalx && locy == goaly){
  
  }
*/
}

