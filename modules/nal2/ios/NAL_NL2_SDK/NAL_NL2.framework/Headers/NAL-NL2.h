
int RealEarInsertionGain_NL2( double REIG[19], double AC[9], double BC[9], double L, int limiting, int channels, int direction, int mic, double ACother[9], int noOfAids );

int RealEarAidedGain_NL2( double REAG[19], double AC[9], double BC[9], double L, int limiting, int channels, int direction, int mic, double ACother[9], int noOfAids );

int TccCouplerGain_NL2( double TccCG[19], double AC[9], double BC[9], double L, int limiting, int channels, int direction, int mic, int target, int aidType, double ACother[9], int noOfAids, int tubing, int vent, int RECDmeasType, int lineType[19] );

int EarSimulatorGain_NL2( double ESG[19], double AC[9], double BC[9], double L, int direction, int mic, int limiting, int channels, int target, int aidType, double ACother[9], int noOfAids, int /*tubing*/, int vent, int /*RECDmeasType*/, int lineType[19] );

int RealEarInputOutputCurve_NL2( double REIO[100], double REIOunl[100], double AC[9], double BC[9], int graphFreq, int startLevel, int finishLevel, int limiting, int channels, int direction, int mic, int target, double ACother[9], int noOfAids );

int TccInputOutputCurve_NL2( double TccIO[100], double TccIOunl[100], double AC[9], double BC[9], int graphFreq, int startLevel, int finishLevel, int limiting, int channels, int direction, int mic, int target, int aidType, double ACother[9], int noOfAids, int /*tubing*/, int vent, int /*RECDmeasType*/, int lineType[100] );

int EarSimulatorInputOutputCurve_NL2( double ESIO[100], double ESIOunl[100], double AC[9], double BC[9], int graphFreq, int startLevel, int finishLevel, int limiting, int channels, int direction, int mic, int target, int aidType, double ACother[9], int noOfAids, int /*tubing*/, int vent, int /*RECDmeasType*/, int lineType[100] );

int Speech_o_Gram_NL2( double Speech_rms[19], double Speech_max[19], double Speech_min[19], double Speech_thresh[19], double AC[9], double BC[9], double L, int limiting, int channels, int direction, int mic, double ACother[9], int noOfAids );

int AidedThreshold_NL2( double AT[19], double AC[9], double BC[9], double CT[19], int dbOption, double ACother[9], int noOfAids, int limiting, int channels, int direction, int mic );

int GetREDDindiv( double REDD[19], int defValues );

int GetREDDindiv9( double REDD[9], int defValues );

int GetREURindiv( double REUR[19], int defValues, int dateOfBirth, int direction, int mic );

int GetREURindiv9( double REUR[9], int defValues, int dateOfBirth, int direction, int mic );

int SetREDDindiv( double REDD[19], int defValues );

int SetREDDindiv9( double REDD[9], int defValues );

int SetREURindiv( double REUR[19], int defValues, int dateOfBirth, int direction, int mic );

int SetREURindiv9( double REUR[9], int defValues, int dateOfBirth, int direction, int mic );

int CrossOverFrequencies_NL2( double CFArray[], int channels, double AC[9], double /*BC*/[9], int FreqInCh[19] );

int CenterFrequencies( int centerF[], double CFArray[], int channels );

int CompressionThreshold_NL2( double CT[19], int bandWidth, int selection, int WBCT, int aidType, int direction, int mic, int calcCh[19] );

int CompressionRatio_NL2( double CR[], int channels, int centreFreq[], double AC[9], double BC[9], int direction, int mic, int limiting, double ACother[9], int noOfAids );

int setBWC( int channels, double crossOver[] );

int getMPO_NL2( double MPO[19], int type, double AC[9], double BC[9], int channels, int limiting );

double GainAt_NL2_Internal( int freqRequired, int targetType, double AC[9], double BC[9], double L, int limiting, int channels, int direction, int mic, double ACother[9], int noOfAids );

int GetMLE( double MLE[19], int aidType, int direction, int mic );

int ReturnValues_NL2( double MAF[19], double BWC[19], double ESCD[19] );

int GetTubing_NL2( double Tubing[19], int tubing );

int GetTubing9_NL2( double Tubing[9], int tubing );

int GetVentOut_NL2( double Ventout[19], int vent );

int GetVentOut9_NL2( double Ventout[9], int vent );

double Get_SI_NL2( int s, double REAG[19], double Limit[19] );

double Get_SII( int nCompSpeed, double Speech_thresh[19], int s, double REAG[19], double REAGp[19], double REAGm[19], double REUR[19] );

void SetAdultChild( int adultChild, int dateOfBirth );

void SetExperience( int experience );

void SetCompSpeed( int compSpeed );

void SetTonalLanguage( int tonal );

void SetGender( int gender );

int GetRECDh_indiv_NL2 ( double RECDh[19], int RECDmeasType, int dateOfBirth, int /*aidType*/, int tubing, int vent, int coupler, int fittingDepth );

int GetRECDh_indiv9_NL2 ( double RECDh[9], int RECDmeasType, int dateOfBirth, int aidType, int tubing, int vent, int coupler, int fittingDepth );

int GetRECDt_indiv_NL2 ( double RECDt[19], int RECDmeasType, int dateOfBirth, int /*aidType*/, int tubing, int vent, int earpiece, int coupler, int fittingDepth );

int GetRECDt_indiv9_NL2 ( double RECDt[9], int RECDmeasType, int dateOfBirth, int aidType, int tubing, int vent, int earpiece, int coupler, int fittingDepth );

int SetRECDh_indiv_NL2( double RECDh[19] );

int SetRECDh_indiv9_NL2( double RECDh[9] );

int SetRECDt_indiv_NL2( double RECDt[19] );

int SetRECDt_indiv9_NL2( double RECDt[9] );
